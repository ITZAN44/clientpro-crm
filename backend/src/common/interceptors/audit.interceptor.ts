import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          const userId = user?.userId || 'anonymous';
          const userRole = user?.rol || 'N/A';
          
          this.logger.log(
            `[${method}] ${url} | User: ${userId} (${userRole}) | ${responseTime}ms`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          const userId = user?.userId || 'anonymous';
          const userRole = user?.rol || 'N/A';
          
          this.logger.error(
            `[${method}] ${url} | User: ${userId} (${userRole}) | ${responseTime}ms | Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
