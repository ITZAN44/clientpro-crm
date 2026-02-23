import { Test, TestingModule } from '@nestjs/testing';
import { NotificacionesService } from './notificaciones.service';
import { PrismaService } from '../prisma/prisma.service';
import { TipoNotificacion } from '@prisma/client';
import { createMockPrismaService, MockPrismaService } from '../testing/prisma.mock';

describe('NotificacionesService', () => {
  let service: NotificacionesService;
  let prisma: MockPrismaService;

  // Datos de prueba
  const mockNegocio = {
    id: 'negocio-1',
    titulo: 'Negocio Test',
    etapa: 'PROSPECTO',
  };

  const mockCliente = {
    id: 'cliente-1',
    nombre: 'Cliente Test',
  };

  const mockActividad = {
    id: 'actividad-1',
    titulo: 'Actividad Test',
    tipo: 'LLAMADA',
  };

  const mockNotificacion = {
    id: 'notif-1',
    tipo: TipoNotificacion.NEGOCIO_ACTUALIZADO,
    titulo: 'Negocio actualizado',
    mensaje: 'El negocio ha sido actualizado',
    leida: false,
    usuarioId: 'user-1',
    negocioRelacionadoId: 'negocio-1',
    clienteRelacionadoId: null,
    actividadRelacionadaId: null,
    urlAccion: '/negocios',
    creadoEn: new Date('2026-02-04'),
    negocioRelacionado: mockNegocio,
    clienteRelacionado: null,
    actividadRelacionada: null,
  };

  const mockCreateNotificacionDto = {
    tipo: TipoNotificacion.NUEVO_CLIENTE,
    titulo: 'Nuevo cliente registrado',
    mensaje: 'Se ha registrado un nuevo cliente',
    usuarioId: 'user-1',
    clienteRelacionadoId: 'cliente-1',
    urlAccion: '/clientes',
  };

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificacionesService>(NotificacionesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear', () => {
    it('debe crear una notificación exitosamente', async () => {
      // Arrange
      prisma.notificacion.create.mockResolvedValue(mockNotificacion as any);

      // Act
      const result = await service.crear(mockCreateNotificacionDto);

      // Assert
      expect(prisma.notificacion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tipo: mockCreateNotificacionDto.tipo,
          titulo: mockCreateNotificacionDto.titulo,
          mensaje: mockCreateNotificacionDto.mensaje,
          usuarioId: mockCreateNotificacionDto.usuarioId,
          clienteRelacionadoId: mockCreateNotificacionDto.clienteRelacionadoId,
          urlAccion: mockCreateNotificacionDto.urlAccion,
        }),
        include: expect.objectContaining({
          negocioRelacionado: expect.any(Object),
          clienteRelacionado: expect.any(Object),
          actividadRelacionada: expect.any(Object),
        }),
      });
      expect(result.titulo).toBe(mockNotificacion.titulo);
      expect(result.tipo).toBe(mockNotificacion.tipo);
    });

    it('debe crear notificación con todas las relaciones opcionales', async () => {
      // Arrange
      const notificacionCompleta = {
        ...mockNotificacion,
        negocioRelacionadoId: 'negocio-1',
        clienteRelacionadoId: 'cliente-1',
        actividadRelacionadaId: 'actividad-1',
        negocioRelacionado: mockNegocio,
        clienteRelacionado: mockCliente,
        actividadRelacionada: mockActividad,
      };

      const dtoCompleto = {
        ...mockCreateNotificacionDto,
        negocioRelacionadoId: 'negocio-1',
        actividadRelacionadaId: 'actividad-1',
      };

      prisma.notificacion.create.mockResolvedValue(notificacionCompleta as any);

      // Act
      const result = await service.crear(dtoCompleto);

      // Assert
      expect(prisma.notificacion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          negocioRelacionadoId: 'negocio-1',
          clienteRelacionadoId: 'cliente-1',
          actividadRelacionadaId: 'actividad-1',
        }),
        include: expect.any(Object),
      });
      expect(result.negocioRelacionado).toBeDefined();
      expect(result.clienteRelacionado).toBeDefined();
      expect(result.actividadRelacionada).toBeDefined();
    });
  });

  describe('listar', () => {
    it('debe retornar lista de notificaciones con paginación', async () => {
      // Arrange
      const usuarioId = 'user-1';
      const query = { pagina: 1, limite: 20 };
      const notificaciones = [
        mockNotificacion,
        { ...mockNotificacion, id: 'notif-2' },
      ];

      prisma.notificacion.findMany.mockResolvedValue(notificaciones as any);
      prisma.notificacion.count.mockResolvedValue(2);

      // Act
      const result = await service.listar(usuarioId, query);

      // Assert
      expect(prisma.notificacion.findMany).toHaveBeenCalledWith({
        where: { usuarioId },
        skip: 0,
        take: 20,
        orderBy: { creadoEn: 'desc' },
        include: expect.any(Object),
      });
      expect(result.notificaciones).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('debe filtrar notificaciones por leida=true', async () => {
      // Arrange
      const usuarioId = 'user-1';
      const query = { pagina: 1, limite: 20, leida: true };
      prisma.notificacion.findMany.mockResolvedValue([mockNotificacion] as any);
      prisma.notificacion.count.mockResolvedValue(1);

      // Act
      await service.listar(usuarioId, query);

      // Assert
      expect(prisma.notificacion.findMany).toHaveBeenCalledWith({
        where: { usuarioId, leida: true },
        skip: 0,
        take: 20,
        orderBy: { creadoEn: 'desc' },
        include: expect.any(Object),
      });
    });

    it('debe filtrar notificaciones por leida=false', async () => {
      // Arrange
      const usuarioId = 'user-1';
      const query = { pagina: 1, limite: 20, leida: false };
      prisma.notificacion.findMany.mockResolvedValue([mockNotificacion] as any);
      prisma.notificacion.count.mockResolvedValue(1);

      // Act
      await service.listar(usuarioId, query);

      // Assert
      expect(prisma.notificacion.findMany).toHaveBeenCalledWith({
        where: { usuarioId, leida: false },
        skip: 0,
        take: 20,
        orderBy: { creadoEn: 'desc' },
        include: expect.any(Object),
      });
    });

    it('debe calcular skip correctamente para página 2', async () => {
      // Arrange
      const usuarioId = 'user-1';
      const query = { pagina: 2, limite: 10 };
      prisma.notificacion.findMany.mockResolvedValue([mockNotificacion] as any);
      prisma.notificacion.count.mockResolvedValue(1);

      // Act
      await service.listar(usuarioId, query);

      // Assert
      expect(prisma.notificacion.findMany).toHaveBeenCalledWith({
        where: { usuarioId },
        skip: 10, // (2-1) * 10 = 10
        take: 10,
        orderBy: { creadoEn: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('obtenerPorId', () => {
    it('debe retornar una notificación por ID', async () => {
      // Arrange
      const notifId = 'notif-1';
      const usuarioId = 'user-1';
      prisma.notificacion.findFirst.mockResolvedValue(mockNotificacion as any);

      // Act
      const result = await service.obtenerPorId(notifId, usuarioId);

      // Assert
      expect(prisma.notificacion.findFirst).toHaveBeenCalledWith({
        where: { id: notifId, usuarioId },
        include: expect.any(Object),
      });
      expect(result.id).toBe(mockNotificacion.id);
      expect(result.titulo).toBe(mockNotificacion.titulo);
    });

    it('debe lanzar error cuando la notificación no existe', async () => {
      // Arrange
      const notifId = 'notif-inexistente';
      const usuarioId = 'user-1';
      prisma.notificacion.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.obtenerPorId(notifId, usuarioId)).rejects.toThrow(
        'Notificación no encontrada',
      );
    });

    it('debe lanzar error cuando la notificación no pertenece al usuario', async () => {
      // Arrange
      const notifId = 'notif-1';
      const usuarioId = 'user-otro';
      prisma.notificacion.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.obtenerPorId(notifId, usuarioId)).rejects.toThrow(
        'Notificación no encontrada',
      );
    });
  });

  describe('marcarComoLeida', () => {
    it('debe marcar notificación como leída exitosamente', async () => {
      // Arrange
      const notifId = 'notif-1';
      const usuarioId = 'user-1';
      const notificacionLeida = { ...mockNotificacion, leida: true };

      prisma.notificacion.updateMany.mockResolvedValue({ count: 1 } as any);
      prisma.notificacion.findFirst.mockResolvedValue(notificacionLeida as any);

      // Act
      const result = await service.marcarComoLeida(notifId, usuarioId);

      // Assert
      expect(prisma.notificacion.updateMany).toHaveBeenCalledWith({
        where: { id: notifId, usuarioId },
        data: { leida: true },
      });
      expect(prisma.notificacion.findFirst).toHaveBeenCalledWith({
        where: { id: notifId, usuarioId },
        include: expect.any(Object),
      });
      expect(result.leida).toBe(true);
    });

    it('debe lanzar error cuando la notificación no existe', async () => {
      // Arrange
      const notifId = 'notif-inexistente';
      const usuarioId = 'user-1';
      prisma.notificacion.updateMany.mockResolvedValue({ count: 0 } as any);

      // Act & Assert
      await expect(service.marcarComoLeida(notifId, usuarioId)).rejects.toThrow(
        'Notificación no encontrada',
      );
      expect(prisma.notificacion.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('marcarTodasComoLeidas', () => {
    it('debe marcar todas las notificaciones no leídas como leídas', async () => {
      // Arrange
      const usuarioId = 'user-1';
      prisma.notificacion.updateMany.mockResolvedValue({ count: 5 } as any);

      // Act
      const result = await service.marcarTodasComoLeidas(usuarioId);

      // Assert
      expect(prisma.notificacion.updateMany).toHaveBeenCalledWith({
        where: { usuarioId, leida: false },
        data: { leida: true },
      });
      expect(result.actualizado).toBe(5);
    });

    it('debe retornar 0 cuando no hay notificaciones no leídas', async () => {
      // Arrange
      const usuarioId = 'user-1';
      prisma.notificacion.updateMany.mockResolvedValue({ count: 0 } as any);

      // Act
      const result = await service.marcarTodasComoLeidas(usuarioId);

      // Assert
      expect(result.actualizado).toBe(0);
    });
  });

  describe('contarNoLeidas', () => {
    it('debe retornar el conteo de notificaciones no leídas', async () => {
      // Arrange
      const usuarioId = 'user-1';
      prisma.notificacion.count.mockResolvedValue(3);

      // Act
      const result = await service.contarNoLeidas(usuarioId);

      // Assert
      expect(prisma.notificacion.count).toHaveBeenCalledWith({
        where: { usuarioId, leida: false },
      });
      expect(result.count).toBe(3);
    });

    it('debe retornar 0 cuando no hay notificaciones no leídas', async () => {
      // Arrange
      const usuarioId = 'user-1';
      prisma.notificacion.count.mockResolvedValue(0);

      // Act
      const result = await service.contarNoLeidas(usuarioId);

      // Assert
      expect(result.count).toBe(0);
    });
  });

  describe('limpiarAntiguas', () => {
    it('debe eliminar notificaciones leídas antiguas (30 días por defecto)', async () => {
      // Arrange
      prisma.notificacion.deleteMany.mockResolvedValue({ count: 10 } as any);

      // Act
      const result = await service.limpiarAntiguas();

      // Assert
      expect(prisma.notificacion.deleteMany).toHaveBeenCalledWith({
        where: {
          creadoEn: {
            lt: expect.any(Date),
          },
          leida: true,
        },
      });
      expect(result.eliminado).toBe(10);
    });

    it('debe eliminar notificaciones con días personalizados', async () => {
      // Arrange
      const dias = 60;
      prisma.notificacion.deleteMany.mockResolvedValue({ count: 15 } as any);

      // Act
      const result = await service.limpiarAntiguas(dias);

      // Assert
      const call = (prisma.notificacion.deleteMany as jest.Mock).mock.calls[0][0];
      const fechaLimite = call.where.creadoEn.lt as Date;
      const haceXDias = new Date();
      haceXDias.setDate(haceXDias.getDate() - dias);

      // Verificar que la fecha límite es aproximadamente hace 60 días (tolerancia de 1 minuto)
      expect(Math.abs(fechaLimite.getTime() - haceXDias.getTime())).toBeLessThan(60000);
      expect(result.eliminado).toBe(15);
    });

    it('debe retornar 0 cuando no hay notificaciones antiguas', async () => {
      // Arrange
      prisma.notificacion.deleteMany.mockResolvedValue({ count: 0 } as any);

      // Act
      const result = await service.limpiarAntiguas();

      // Assert
      expect(result.eliminado).toBe(0);
    });
  });
});
