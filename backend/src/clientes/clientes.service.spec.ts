import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario } from '@prisma/client';
import { createMockPrismaService, MockPrismaService } from '../testing/prisma.mock';

describe('ClientesService', () => {
  let service: ClientesService;
  let prisma: MockPrismaService;

  // Datos de prueba
  const mockPropietario = {
    id: 'user-1',
    nombre: 'Test User',
    email: 'test@example.com',
  };

  const mockCliente = {
    id: 'cliente-1',
    nombre: 'Cliente Test',
    email: 'cliente@example.com',
    telefono: '+1234567890',
    empresa: 'Empresa Test S.A.',
    puesto: 'CEO',
    direccion: 'Calle Test 123',
    ciudad: 'Ciudad Test',
    pais: 'México',
    sitioWeb: 'https://example.com',
    notas: 'Notas de prueba',
    propietarioId: 'user-1',
    propietario: mockPropietario,
    creadoEn: new Date('2026-01-01'),
    actualizadoEn: new Date('2026-01-01'),
  };

  const mockCreateClienteDto = {
    nombre: 'Nuevo Cliente',
    email: 'nuevo@example.com',
    telefono: '+9876543210',
    empresa: 'Nueva Empresa',
    puesto: 'Manager',
    direccion: 'Av. Nueva 456',
    ciudad: 'CDMX',
    pais: 'México',
    sitioWeb: 'https://nuevaempresa.com',
    notas: 'Cliente potencial',
  };

  const mockUsuarioAdmin = {
    userId: 'admin-1',
    rol: RolUsuario.ADMIN,
  };

  const mockUsuarioVendedor = {
    userId: 'vendedor-1',
    rol: RolUsuario.VENDEDOR,
  };

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un cliente y asignar propietario actual cuando no se proporciona propietarioId', async () => {
      // Arrange
      const usuarioId = 'user-1';
      prisma.usuario.findUnique.mockResolvedValue(mockPropietario as any);
      prisma.cliente.create.mockResolvedValue(mockCliente as any);

      // Act
      const result = await service.create(mockCreateClienteDto, usuarioId);

      // Assert
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: usuarioId },
      });
      expect(prisma.cliente.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...mockCreateClienteDto,
          propietarioId: usuarioId,
        }),
        include: {
          propietario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      });
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('nombre', mockCliente.nombre);
    });

    it('debe usar propietarioId proporcionado si existe', async () => {
      // Arrange
      const usuarioId = 'user-1';
      const createDtoConPropietario = {
        ...mockCreateClienteDto,
        propietarioId: 'user-2',
      };
      prisma.usuario.findUnique.mockResolvedValue({ id: 'user-2', nombre: 'Otro Usuario' } as any);
      prisma.cliente.create.mockResolvedValue({
        ...mockCliente,
        propietarioId: 'user-2',
      } as any);

      // Act
      await service.create(createDtoConPropietario, usuarioId);

      // Assert
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-2' },
      });
      expect(prisma.cliente.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            propietarioId: 'user-2',
          }),
        }),
      );
    });

    it('debe lanzar BadRequestException si el propietario no existe', async () => {
      // Arrange
      const usuarioId = 'user-999';
      prisma.usuario.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(mockCreateClienteDto, usuarioId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(mockCreateClienteDto, usuarioId)).rejects.toThrow(
        'El propietario especificado no existe',
      );

      expect(prisma.cliente.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los clientes con paginación', async () => {
      // Arrange
      const clientes = [mockCliente, { ...mockCliente, id: 'cliente-2' }];
      prisma.cliente.findMany.mockResolvedValue(clientes as any);
      prisma.cliente.count.mockResolvedValue(2);

      // Act
      const result = await service.findAll(1, 10);

      // Assert
      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'cliente-1' }),
          expect.objectContaining({ id: 'cliente-2' }),
        ]),
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(prisma.cliente.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { creadoEn: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('debe filtrar por búsqueda cuando se proporciona search', async () => {
      // Arrange
      const search = 'test';
      prisma.cliente.findMany.mockResolvedValue([mockCliente] as any);
      prisma.cliente.count.mockResolvedValue(1);

      // Act
      await service.findAll(1, 10, search);

      // Assert
      expect(prisma.cliente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { nombre: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { empresa: { contains: search, mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('debe filtrar solo clientes propios cuando el usuario es VENDEDOR', async () => {
      // Arrange
      const vendedorClientes = [{ ...mockCliente, propietarioId: 'vendedor-1' }];
      prisma.cliente.findMany.mockResolvedValue(vendedorClientes as any);
      prisma.cliente.count.mockResolvedValue(1);

      // Act
      await service.findAll(1, 10, undefined, mockUsuarioVendedor);

      // Assert
      expect(prisma.cliente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { propietarioId: 'vendedor-1' },
        }),
      );
    });

    it('debe retornar todos los clientes cuando el usuario es ADMIN', async () => {
      // Arrange
      const todosClientes = [mockCliente, { ...mockCliente, id: 'cliente-2', propietarioId: 'otro-user' }];
      prisma.cliente.findMany.mockResolvedValue(todosClientes as any);
      prisma.cliente.count.mockResolvedValue(2);

      // Act
      await service.findAll(1, 10, undefined, mockUsuarioAdmin);

      // Assert
      expect(prisma.cliente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {}, // No filtro por propietario
        }),
      );
    });

    it('debe calcular totalPages correctamente', async () => {
      // Arrange
      prisma.cliente.findMany.mockResolvedValue([mockCliente] as any);
      prisma.cliente.count.mockResolvedValue(25);

      // Act
      const result = await service.findAll(1, 10);

      // Assert
      expect(result.meta.totalPages).toBe(3); // ceil(25 / 10)
    });
  });

  describe('findOne', () => {
    it('debe retornar un cliente cuando existe', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue(mockCliente as any);

      // Act
      const result = await service.findOne('cliente-1');

      // Assert
      expect(result).toHaveProperty('id', 'cliente-1');
      expect(result).toHaveProperty('nombre', mockCliente.nombre);
      expect(prisma.cliente.findUnique).toHaveBeenCalledWith({
        where: { id: 'cliente-1' },
        include: {
          propietario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      });
    });

    it('debe lanzar NotFoundException cuando el cliente no existe', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('cliente-999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('cliente-999')).rejects.toThrow(
        'Cliente con ID cliente-999 no encontrado',
      );
    });

    it('debe permitir a ADMIN ver cualquier cliente', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue({
        ...mockCliente,
        propietarioId: 'otro-usuario',
      } as any);

      // Act
      const result = await service.findOne('cliente-1', mockUsuarioAdmin);

      // Assert
      expect(result).toHaveProperty('id', 'cliente-1');
    });

    it('debe lanzar ForbiddenException cuando VENDEDOR intenta ver cliente que no es suyo', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue({
        ...mockCliente,
        propietarioId: 'otro-usuario', // No es el vendedor
      } as any);

      // Act & Assert
      await expect(service.findOne('cliente-1', mockUsuarioVendedor)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.findOne('cliente-1', mockUsuarioVendedor)).rejects.toThrow(
        'No tienes permiso para ver este cliente',
      );
    });

    it('debe permitir a VENDEDOR ver su propio cliente', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue({
        ...mockCliente,
        propietarioId: 'vendedor-1', // Es su cliente
      } as any);

      // Act
      const result = await service.findOne('cliente-1', mockUsuarioVendedor);

      // Assert
      expect(result).toHaveProperty('id', 'cliente-1');
    });
  });

  describe('update', () => {
    const updateDto = {
      nombre: 'Cliente Actualizado',
      email: 'actualizado@example.com',
    };

    it('debe actualizar un cliente correctamente', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue(mockCliente as any);
      prisma.cliente.update.mockResolvedValue({
        ...mockCliente,
        ...updateDto,
      } as any);

      // Act
      const result = await service.update('cliente-1', updateDto);

      // Assert
      expect(result.nombre).toBe('Cliente Actualizado');
      expect(result.email).toBe('actualizado@example.com');
      expect(prisma.cliente.update).toHaveBeenCalledWith({
        where: { id: 'cliente-1' },
        data: updateDto,
        include: {
          propietario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      });
    });

    it('debe lanzar NotFoundException si el cliente no existe', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('cliente-999', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update('cliente-999', updateDto)).rejects.toThrow(
        'Cliente con ID cliente-999 no encontrado',
      );

      expect(prisma.cliente.update).not.toHaveBeenCalled();
    });

    it('debe validar que el nuevo propietario existe cuando se cambia propietarioId', async () => {
      // Arrange
      const updateConPropietario = {
        ...updateDto,
        propietarioId: 'nuevo-propietario',
      };
      prisma.cliente.findUnique.mockResolvedValueOnce(mockCliente as any); // Cliente existe
      prisma.usuario.findUnique.mockResolvedValue({ id: 'nuevo-propietario' } as any); // Propietario existe
      prisma.cliente.update.mockResolvedValue({
        ...mockCliente,
        propietarioId: 'nuevo-propietario',
      } as any);

      // Act
      await service.update('cliente-1', updateConPropietario);

      // Assert
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'nuevo-propietario' },
      });
    });

    it('debe lanzar BadRequestException si el nuevo propietario no existe', async () => {
      // Arrange
      const updateConPropietarioInvalido = {
        ...updateDto,
        propietarioId: 'propietario-999',
      };
      prisma.cliente.findUnique.mockResolvedValue(mockCliente as any);
      prisma.usuario.findUnique.mockResolvedValue(null); // Propietario no existe

      // Act & Assert
      await expect(service.update('cliente-1', updateConPropietarioInvalido)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update('cliente-1', updateConPropietarioInvalido)).rejects.toThrow(
        'El propietario especificado no existe',
      );

      expect(prisma.cliente.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debe eliminar un cliente correctamente', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue(mockCliente as any);
      prisma.cliente.delete.mockResolvedValue(mockCliente as any);

      // Act
      const result = await service.remove('cliente-1');

      // Assert
      expect(result).toEqual({ message: 'Cliente eliminado correctamente' });
      expect(prisma.cliente.delete).toHaveBeenCalledWith({
        where: { id: 'cliente-1' },
      });
    });

    it('debe lanzar NotFoundException si el cliente no existe', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('cliente-999')).rejects.toThrow(NotFoundException);
      await expect(service.remove('cliente-999')).rejects.toThrow(
        'Cliente con ID cliente-999 no encontrado',
      );

      expect(prisma.cliente.delete).not.toHaveBeenCalled();
    });
  });
});
