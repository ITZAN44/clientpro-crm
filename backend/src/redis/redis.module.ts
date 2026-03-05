import { Module, Global } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';

/**
 * Módulo global de Redis Cache
 * Usa ioredis directamente sin cache-manager por compatibilidad
 */
@Global()
@Module({
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisModule {}
