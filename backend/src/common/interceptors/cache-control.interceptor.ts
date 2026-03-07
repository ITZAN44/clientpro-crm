import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;

    return next.handle().pipe(
      map((data) => {
        // Solo cachear GET requests
        if (method === 'GET') {
          response.setHeader('Cache-Control', 'private, no-cache');

          // Generar ETag basado en contenido
          const etag = this.generateETag(data);
          response.setHeader('ETag', etag);
          // Express maneja el 304 automáticamente via req.fresh
          // cuando If-None-Match coincide con ETag — no llamar .send() manualmente
        } else {
          // POST, PUT, PATCH, DELETE no deben cachearse
          response.setHeader(
            'Cache-Control',
            'no-cache, no-store, must-revalidate',
          );
        }

        return data;
      }),
    );
  }

  private generateETag(data: any): string {
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
    return `"${hash}"`;
  }
}
