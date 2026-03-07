import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
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

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
}
bootstrap();
