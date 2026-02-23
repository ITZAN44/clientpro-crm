import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ActividadesService } from './actividades.service';
import { PrismaService } from '../prisma/prisma.service';
import { TipoActividad } from './dto/create-actividad.dto';
import { createMockPrismaService, MockPrismaService } from '../testing/prisma.mock';

describe('ActividadesService', () => {
  let service: ActividadesService;
  let prisma: MockPrismaService;

  // Datos de prueba
  const mockNegocio = {
    id: 'negocio-1',
    titulo: 'Negocio Test',
    valor: 50000,
    etapa: 'PROSPECTO',
  };

  const mockCliente = {
    id: 'cliente-1',
    nombre: 'Cliente Test',
    empresa: 'Empresa Test S.A.',
    email: 'cliente@example.com',
  };

  const mockUsuario = {
    id: 'user-1',
    nombre: 'Test User',
    email: 'test@example.com',
  };

  const mockActividad = {
    id: 'actividad-1',
    tipo: TipoActividad.LLAMADA,
    titulo: 'Llamada de seguimiento',
    descripcion: 'Hacer seguimiento al cliente',
    fechaVencimiento: new Date('2026-02-10'),
    completada: false,
    completadaEn: null,
    negocioId: 'negocio-1',
    clienteId: 'cliente-1',
    asignadoA: 'user-1',
    creadoPor: 'user-1',
    creadoEn: new Date('2026-02-04'),
    actualizadoEn: new Date('2026-02-04'),
    negocio: mockNegocio,
    cliente: mockCliente,
    usuarioAsignado: mockUsuario,
    usuarioCreador: mockUsuario,
  };

  const mockCreateActividadDto = {
    tipo: TipoActividad.REUNION,
    titulo: 'Reunión con cliente',
    descripcion: 'Presentación de propuesta',
    fechaVencimiento: '2026-02-15',
    completada: false,
    negocioId: 'negocio-1',
    clienteId: 'cliente-1',
    asignadoA: 'user-1',
  };

  const mockUpdateActividadDto = {
    titulo: 'Reunión actualizada',
    descripcion: 'Descripción actualizada',
    completada: true,
  };

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActividadesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ActividadesService>(ActividadesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una actividad con negocio y cliente válidos', async () => {
      // Arrange
      const userId = 'user-1';
      prisma.negocio.findUnique.mockResolvedValue(mockNegocio as any);
      prisma.cliente.findUnique.mockResolvedValue(mockCliente as any);
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario as any);
      prisma.actividad.create.mockResolvedValue(mockActividad as any);

      // Act
      const result = await service.create(mockCreateActividadDto, userId);

      // Assert
      expect(prisma.negocio.findUnique).toHaveBeenCalledWith({
        where: { id: mockCreateActividadDto.negocioId },
      });
      expect(prisma.cliente.findUnique).toHaveBeenCalledWith({
        where: { id: mockCreateActividadDto.clienteId },
      });
      expect(prisma.actividad.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tipo: mockCreateActividadDto.tipo,
          titulo: mockCreateActividadDto.titulo,
          descripcion: mockCreateActividadDto.descripcion,
          negocioId: mockCreateActividadDto.negocioId,
          clienteId: mockCreateActividadDto.clienteId,
          asignadoA: mockCreateActividadDto.asignadoA,
          creadoPor: userId,
        }),
        include: expect.any(Object),
      });
      expect(result.titulo).toBe(mockActividad.titulo);
    });

    it('debe asignar usuario actual cuando no se proporciona asignadoA', async () => {
      // Arrange
      const userId = 'user-2';
      const dtoSinAsignado = { ...mockCreateActividadDto };
      delete dtoSinAsignado.asignadoA;

      prisma.negocio.findUnique.mockResolvedValue(mockNegocio as any);
      prisma.cliente.findUnique.mockResolvedValue(mockCliente as any);
      prisma.actividad.create.mockResolvedValue({
        ...mockActividad,
        asignadoA: userId,
      } as any);

      // Act
      await service.create(dtoSinAsignado, userId);

      // Assert
      expect(prisma.actividad.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          asignadoA: userId, // Usuario actual
          creadoPor: userId,
        }),
        include: expect.any(Object),
      });
    });

    it('debe lanzar BadRequestException cuando no tiene negocioId ni clienteId', async () => {
      // Arrange
      const userId = 'user-1';
      const dtoSinRelacion = {
        tipo: TipoActividad.TAREA,
        titulo: 'Tarea sin relación',
      };

      // Act & Assert
      await expect(service.create(dtoSinRelacion as any, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(dtoSinRelacion as any, userId)).rejects.toThrow(
        'La actividad debe estar asociada a un negocio o a un cliente',
      );
    });

    it('debe lanzar NotFoundException cuando el negocio no existe', async () => {
      // Arrange
      const userId = 'user-1';
      prisma.negocio.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(mockCreateActividadDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(mockCreateActividadDto, userId)).rejects.toThrow(
        `Negocio con ID ${mockCreateActividadDto.negocioId} no encontrado`,
      );
    });

    it('debe lanzar NotFoundException cuando el cliente no existe', async () => {
      // Arrange
      const userId = 'user-1';
      prisma.negocio.findUnique.mockResolvedValue(mockNegocio as any);
      prisma.cliente.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(mockCreateActividadDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(mockCreateActividadDto, userId)).rejects.toThrow(
        `Cliente con ID ${mockCreateActividadDto.clienteId} no encontrado`,
      );
    });

    it('debe lanzar NotFoundException cuando el usuario asignado no existe', async () => {
      // Arrange
      const userId = 'user-1';
      prisma.negocio.findUnique.mockResolvedValue(mockNegocio as any);
      prisma.cliente.findUnique.mockResolvedValue(mockCliente as any);
      prisma.usuario.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(mockCreateActividadDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(mockCreateActividadDto, userId)).rejects.toThrow(
        `Usuario con ID ${mockCreateActividadDto.asignadoA} no encontrado`,
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar lista de actividades con paginación', async () => {
      // Arrange
      const userId = 'user-1';
      const query = { page: 1, limit: 10 };
      const actividades = [mockActividad, { ...mockActividad, id: 'actividad-2' }];
      prisma.actividad.findMany.mockResolvedValue(actividades as any);
      prisma.actividad.count.mockResolvedValue(2);

      // Act
      const result = await service.findAll(userId, query);

      // Assert
      expect(prisma.actividad.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: [
          { completada: 'asc' },
          { fechaVencimiento: 'asc' },
        ],
        include: expect.any(Object),
      });
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('debe filtrar actividades por búsqueda (título, descripción)', async () => {
      // Arrange
      const userId = 'user-1';
      const query = { search: 'seguimiento' };
      prisma.actividad.findMany.mockResolvedValue([mockActividad] as any);
      prisma.actividad.count.mockResolvedValue(1);

      // Act
      await service.findAll(userId, query);

      // Assert
      expect(prisma.actividad.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { titulo: { contains: 'seguimiento', mode: 'insensitive' } },
            { descripcion: { contains: 'seguimiento', mode: 'insensitive' } },
          ],
        },
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: expect.any(Array),
        include: expect.any(Object),
      });
    });

    it('debe filtrar actividades por tipo', async () => {
      // Arrange
      const userId = 'user-1';
      const query = { tipo: TipoActividad.LLAMADA };
      prisma.actividad.findMany.mockResolvedValue([mockActividad] as any);
      prisma.actividad.count.mockResolvedValue(1);

      // Act
      await service.findAll(userId, query);

      // Assert
      expect(prisma.actividad.findMany).toHaveBeenCalledWith({
        where: { tipo: TipoActividad.LLAMADA },
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: expect.any(Array),
        include: expect.any(Object),
      });
    });

    it('debe filtrar actividades por completada', async () => {
      // Arrange
      const userId = 'user-1';
      const query = { completada: 'true' };
      prisma.actividad.findMany.mockResolvedValue([mockActividad] as any);
      prisma.actividad.count.mockResolvedValue(1);

      // Act
      await service.findAll(userId, query);

      // Assert
      expect(prisma.actividad.findMany).toHaveBeenCalledWith({
        where: { completada: true },
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: expect.any(Array),
        include: expect.any(Object),
      });
    });

    it('debe filtrar actividades por asignado', async () => {
      // Arrange
      const userId = 'user-1';
      const query = { asignadoA: 'user-2' };
      prisma.actividad.findMany.mockResolvedValue([mockActividad] as any);
      prisma.actividad.count.mockResolvedValue(1);

      // Act
      await service.findAll(userId, query);

      // Assert
      expect(prisma.actividad.findMany).toHaveBeenCalledWith({
        where: { asignadoA: 'user-2' },
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: expect.any(Array),
        include: expect.any(Object),
      });
    });
  });

  describe('findOne', () => {
    it('debe retornar una actividad por ID', async () => {
      // Arrange
      const actividadId = 'actividad-1';
      prisma.actividad.findUnique.mockResolvedValue(mockActividad as any);

      // Act
      const result = await service.findOne(actividadId);

      // Assert
      expect(prisma.actividad.findUnique).toHaveBeenCalledWith({
        where: { id: actividadId },
        include: expect.any(Object),
      });
      expect(result.id).toBe(mockActividad.id);
      expect(result.titulo).toBe(mockActividad.titulo);
    });

    it('debe lanzar NotFoundException cuando la actividad no existe', async () => {
      // Arrange
      const actividadId = 'actividad-inexistente';
      prisma.actividad.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(actividadId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(actividadId)).rejects.toThrow(
        `Actividad con ID ${actividadId} no encontrada`,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar una actividad exitosamente', async () => {
      // Arrange
      const actividadId = 'actividad-1';
      const userId = 'user-1';
      prisma.actividad.findUnique.mockResolvedValue(mockActividad as any);
      prisma.actividad.update.mockResolvedValue({
        ...mockActividad,
        ...mockUpdateActividadDto,
      } as any);

      // Act
      const result = await service.update(actividadId, mockUpdateActividadDto, userId);

      // Assert
      expect(prisma.actividad.findUnique).toHaveBeenCalledWith({
        where: { id: actividadId },
        include: expect.any(Object),
      });
      expect(prisma.actividad.update).toHaveBeenCalledWith({
        where: { id: actividadId },
        data: expect.objectContaining({
          titulo: mockUpdateActividadDto.titulo,
          descripcion: mockUpdateActividadDto.descripcion,
          completada: mockUpdateActividadDto.completada,
        }),
        include: expect.any(Object),
      });
      expect(result.titulo).toBe(mockUpdateActividadDto.titulo);
    });

    it('debe validar negocio existente al actualizar negocioId', async () => {
      // Arrange
      const actividadId = 'actividad-1';
      const userId = 'user-1';
      const updateDto = { negocioId: 'negocio-2' };

      prisma.actividad.findUnique.mockResolvedValue(mockActividad as any);
      prisma.negocio.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(actividadId, updateDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(actividadId, updateDto, userId)).rejects.toThrow(
        `Negocio con ID ${updateDto.negocioId} no encontrado`,
      );
    });

    it('debe validar cliente existente al actualizar clienteId', async () => {
      // Arrange
      const actividadId = 'actividad-1';
      const userId = 'user-1';
      const updateDto = { clienteId: 'cliente-2' };

      prisma.actividad.findUnique.mockResolvedValue(mockActividad as any);
      prisma.cliente.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(actividadId, updateDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(actividadId, updateDto, userId)).rejects.toThrow(
        `Cliente con ID ${updateDto.clienteId} no encontrado`,
      );
    });

    it('debe validar usuario existente al actualizar asignadoA', async () => {
      // Arrange
      const actividadId = 'actividad-1';
      const userId = 'user-1';
      const updateDto = { asignadoA: 'user-inexistente' };

      prisma.actividad.findUnique.mockResolvedValue(mockActividad as any);
      prisma.usuario.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(actividadId, updateDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(actividadId, updateDto, userId)).rejects.toThrow(
        `Usuario con ID ${updateDto.asignadoA} no encontrado`,
      );
    });
  });

  describe('marcarCompletada', () => {
    it('debe marcar una actividad como completada con timestamp', async () => {
      // Arrange
      const actividadId = 'actividad-1';
      const actividadCompletada = {
        ...mockActividad,
        completada: true,
        completadaEn: new Date(),
      };

      prisma.actividad.findUnique.mockResolvedValue(mockActividad as any);
      prisma.actividad.update.mockResolvedValue(actividadCompletada as any);

      // Act
      const result = await service.marcarCompletada(actividadId);

      // Assert
      expect(prisma.actividad.update).toHaveBeenCalledWith({
        where: { id: actividadId },
        data: {
          completada: true,
          completadaEn: expect.any(Date),
        },
        include: expect.any(Object),
      });
      expect(result.completada).toBe(true);
      expect(result.completadaEn).toBeDefined();
    });

    it('debe lanzar NotFoundException cuando la actividad no existe', async () => {
      // Arrange
      const actividadId = 'actividad-inexistente';
      prisma.actividad.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.marcarCompletada(actividadId)).rejects.toThrow(NotFoundException);
      await expect(service.marcarCompletada(actividadId)).rejects.toThrow(
        `Actividad con ID ${actividadId} no encontrada`,
      );
      expect(prisma.actividad.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debe eliminar una actividad exitosamente', async () => {
      // Arrange
      const actividadId = 'actividad-1';
      prisma.actividad.findUnique.mockResolvedValue(mockActividad as any);
      prisma.actividad.delete.mockResolvedValue(mockActividad as any);

      // Act
      const result = await service.remove(actividadId);

      // Assert
      expect(prisma.actividad.findUnique).toHaveBeenCalledWith({
        where: { id: actividadId },
        include: expect.any(Object),
      });
      expect(prisma.actividad.delete).toHaveBeenCalledWith({
        where: { id: actividadId },
      });
      expect(result.message).toBe('Actividad eliminada correctamente');
    });

    it('debe lanzar NotFoundException cuando la actividad no existe', async () => {
      // Arrange
      const actividadId = 'actividad-inexistente';
      prisma.actividad.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(actividadId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(actividadId)).rejects.toThrow(
        `Actividad con ID ${actividadId} no encontrada`,
      );
      expect(prisma.actividad.delete).not.toHaveBeenCalled();
    });
  });
});
