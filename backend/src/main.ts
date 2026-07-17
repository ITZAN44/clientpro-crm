import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import compression from 'compression';
import helmet from 'helmet';
import { CacheControlInterceptor } from './common/interceptors/cache-control.interceptor';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [new winston.transports.Console()],
    }),
  });

  // Seguridad HTTP headers
  app.use(helmet());

  // Middleware de compresión (gzip)
  app.use(compression());

  // Configurar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Interceptor global de cache control y ETags
  app.useGlobalInterceptors(new CacheControlInterceptor());

  // API reference, generated from the controllers and DTOs themselves.
  //
  // The @nestjs/swagger CLI plugin (see nest-cli.json) derives every schema
  // from the TypeScript types and class-validator decorators that already
  // exist, so nothing here is hand-written and nothing can drift out of sync
  // with the code.
  //
  // Off by default under NODE_ENV=production: the spec enumerates every route
  // and payload shape, which is reconnaissance material for an attacker. The
  // docker-compose environment sets NODE_ENV=production even locally, so
  // SWAGGER_ENABLED=true exists to turn it back on deliberately.
  const docsEnabled =
    process.env.SWAGGER_ENABLED === 'true' ||
    process.env.NODE_ENV !== 'production';

  if (docsEnabled) {
    const config = new DocumentBuilder()
      .setTitle('ClientPro CRM API')
      .setDescription(
        'Routes are served at the root — there is no global `api` prefix. ' +
          'The `/api` seen from the browser is added by nginx and stripped by ' +
          'the proxy before requests reach this service.',
      )
      .setVersion('0.7.0')
      .addBearerAuth()
      .build();

    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
}
bootstrap();
