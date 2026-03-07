import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Servicio de cache directo con Redis usando ioredis
 * Bypass de cache-manager para garantizar funcionamiento con Redis
 */
@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly redis: Redis;
  private readonly defaultTTL = 300; // 5 minutos en segundos

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.redis.on('connect', () => {
      this.logger.log('✅ Redis conectado correctamente (ioredis)');
    });

    this.redis.on('error', (err) => {
      this.logger.error('❌ Error de conexión Redis:', err.message);
    });
  }

  /**
   * Obtener valor del cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) {
        this.logger.debug(`[CACHE MISS] ${key}`);
        return null;
      }
      this.logger.debug(`[CACHE HIT] ${key}`);
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error al obtener cache ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Guardar valor en cache
   * @param key Clave
   * @param value Valor (será serializado a JSON)
   * @param ttl TTL en segundos (default: 300s = 5min)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const ttlSeconds = ttl || this.defaultTTL;
      await this.redis.setex(key, ttlSeconds, serialized);
      this.logger.debug(`[CACHE SET] ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      this.logger.error(`Error al guardar cache ${key}:`, error.message);
    }
  }

  /**
   * Eliminar clave específica
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.logger.debug(`[CACHE DEL] ${key}`);
    } catch (error) {
      this.logger.error(`Error al eliminar cache ${key}:`, error.message);
    }
  }

  /**
   * Eliminar múltiples claves por patrón
   * @param pattern Patrón de búsqueda (ej: "clientes:*")
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(
          `[CACHE DEL PATTERN] ${pattern} (${keys.length} keys)`,
        );
      }
    } catch (error) {
      this.logger.error(`Error al eliminar pattern ${pattern}:`, error.message);
    }
  }

  /**
   * Limpiar todo el cache
   */
  async reset(): Promise<void> {
    try {
      await this.redis.flushdb();
      this.logger.log('[CACHE RESET] Cache completamente limpiado');
    } catch (error) {
      this.logger.error('Error al resetear cache:', error.message);
    }
  }

  /**
   * Obtener estadísticas de Redis
   */
  async getStats(): Promise<{ keys: number; memory: string }> {
    try {
      const dbsize = await this.redis.dbsize();
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch ? memoryMatch[1] : 'N/A';

      return { keys: dbsize, memory };
    } catch (error) {
      this.logger.error('Error al obtener stats:', error.message);
      return { keys: 0, memory: 'N/A' };
    }
  }

  /**
   * Verificar si Redis está conectado
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  onModuleDestroy() {
    this.redis.disconnect();
    this.logger.log('Redis desconectado');
  }
}
