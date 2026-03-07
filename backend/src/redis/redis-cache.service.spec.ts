import { Test, TestingModule } from '@nestjs/testing';
import { RedisCacheService } from './redis-cache.service';

// Mock instance compartido — accesible en jest.mock porque el nombre empieza con "mock"
const mockRedisInstance = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  flushdb: jest.fn(),
  dbsize: jest.fn(),
  info: jest.fn(),
  ping: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
};

jest.mock('ioredis', () => jest.fn(() => mockRedisInstance));

describe('RedisCacheService', () => {
  let service: RedisCacheService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisCacheService],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
  });

  describe('get', () => {
    it('debe retornar null cuando la clave no existe (cache miss)', async () => {
      // Arrange
      mockRedisInstance.get.mockResolvedValue(null);

      // Act
      const result = await service.get('test-key');

      // Assert
      expect(result).toBeNull();
      expect(mockRedisInstance.get).toHaveBeenCalledWith('test-key');
    });

    it('debe retornar el valor deserializado en cache hit', async () => {
      // Arrange
      const data = { id: 1, nombre: 'Test Cliente' };
      mockRedisInstance.get.mockResolvedValue(JSON.stringify(data));

      // Act
      const result = await service.get<typeof data>('test-key');

      // Assert
      expect(result).toEqual(data);
      expect(mockRedisInstance.get).toHaveBeenCalledWith('test-key');
    });

    it('debe retornar null (sin lanzar) cuando Redis falla', async () => {
      // Arrange
      mockRedisInstance.get.mockRejectedValue(new Error('Redis down'));

      // Act
      const result = await service.get('test-key');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('debe guardar el valor serializado con TTL explícito', async () => {
      // Arrange
      const data = { id: 1, nombre: 'Test' };
      mockRedisInstance.setex.mockResolvedValue('OK');

      // Act
      await service.set('test-key', data, 60);

      // Assert
      expect(mockRedisInstance.setex).toHaveBeenCalledWith(
        'test-key',
        60,
        JSON.stringify(data),
      );
    });

    it('debe usar TTL por defecto (300s) cuando no se proporciona TTL', async () => {
      // Arrange
      mockRedisInstance.setex.mockResolvedValue('OK');

      // Act
      await service.set('test-key', { id: 1 });

      // Assert
      expect(mockRedisInstance.setex).toHaveBeenCalledWith(
        'test-key',
        300,
        expect.any(String),
      );
    });

    it('debe no lanzar cuando Redis falla al guardar', async () => {
      // Arrange
      mockRedisInstance.setex.mockRejectedValue(new Error('Redis down'));

      // Act & Assert
      await expect(service.set('test-key', { id: 1 })).resolves.not.toThrow();
    });
  });

  describe('del', () => {
    it('debe eliminar la clave especificada', async () => {
      // Arrange
      mockRedisInstance.del.mockResolvedValue(1);

      // Act
      await service.del('test-key');

      // Assert
      expect(mockRedisInstance.del).toHaveBeenCalledWith('test-key');
    });

    it('debe no lanzar cuando Redis falla al eliminar', async () => {
      // Arrange
      mockRedisInstance.del.mockRejectedValue(new Error('Redis down'));

      // Act & Assert
      await expect(service.del('test-key')).resolves.not.toThrow();
    });
  });

  describe('delPattern', () => {
    it('debe eliminar todas las claves que coinciden con el patrón', async () => {
      // Arrange
      const matchingKeys = ['clientes:1', 'clientes:2', 'clientes:all'];
      mockRedisInstance.keys.mockResolvedValue(matchingKeys);
      mockRedisInstance.del.mockResolvedValue(3);

      // Act
      await service.delPattern('clientes:*');

      // Assert
      expect(mockRedisInstance.keys).toHaveBeenCalledWith('clientes:*');
      expect(mockRedisInstance.del).toHaveBeenCalledWith(...matchingKeys);
    });

    it('no debe llamar a del cuando no hay claves que coincidan', async () => {
      // Arrange
      mockRedisInstance.keys.mockResolvedValue([]);

      // Act
      await service.delPattern('clientes:*');

      // Assert
      expect(mockRedisInstance.keys).toHaveBeenCalledWith('clientes:*');
      expect(mockRedisInstance.del).not.toHaveBeenCalled();
    });

    it('debe no lanzar cuando Redis falla', async () => {
      // Arrange
      mockRedisInstance.keys.mockRejectedValue(new Error('Redis down'));

      // Act & Assert
      await expect(service.delPattern('clientes:*')).resolves.not.toThrow();
    });
  });

  describe('reset', () => {
    it('debe llamar flushdb para limpiar toda la base de datos', async () => {
      // Arrange
      mockRedisInstance.flushdb.mockResolvedValue('OK');

      // Act
      await service.reset();

      // Assert
      expect(mockRedisInstance.flushdb).toHaveBeenCalled();
    });

    it('debe no lanzar cuando Redis falla al resetear', async () => {
      // Arrange
      mockRedisInstance.flushdb.mockRejectedValue(new Error('Redis down'));

      // Act & Assert
      await expect(service.reset()).resolves.not.toThrow();
    });
  });

  describe('getStats', () => {
    it('debe retornar keys y memoria cuando Redis responde correctamente', async () => {
      // Arrange
      mockRedisInstance.dbsize.mockResolvedValue(42);
      mockRedisInstance.info.mockResolvedValue(
        'used_memory_human:1.50M\r\nother_info:value\r\n',
      );

      // Act
      const result = await service.getStats();

      // Assert
      expect(result).toEqual({ keys: 42, memory: '1.50M' });
    });

    it('debe retornar valores por defecto cuando Redis falla', async () => {
      // Arrange
      mockRedisInstance.dbsize.mockRejectedValue(new Error('Redis down'));

      // Act
      const result = await service.getStats();

      // Assert
      expect(result).toEqual({ keys: 0, memory: 'N/A' });
    });
  });

  describe('isConnected', () => {
    it('debe retornar true cuando Redis responde al ping', async () => {
      // Arrange
      mockRedisInstance.ping.mockResolvedValue('PONG');

      // Act
      const result = await service.isConnected();

      // Assert
      expect(result).toBe(true);
    });

    it('debe retornar false cuando el ping falla', async () => {
      // Arrange
      mockRedisInstance.ping.mockRejectedValue(new Error('Connection refused'));

      // Act
      const result = await service.isConnected();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('onModuleDestroy', () => {
    it('debe llamar disconnect al destruir el módulo', () => {
      // Act
      service.onModuleDestroy();

      // Assert
      expect(mockRedisInstance.disconnect).toHaveBeenCalled();
    });
  });
});
