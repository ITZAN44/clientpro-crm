import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NegociosService } from './negocios.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesGateway } from '../notificaciones/notificaciones.gateway';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { EtapaNegocio, TipoMoneda } from '@prisma/client';
import { createMockPrismaService, MockPrismaService } from '../testing/prisma.mock';

describe('NegociosService', () => {
  let service: NegociosService;
  let prisma: MockPrismaService;
  let notificacionesGateway: jest.Mocked<NotificacionesGateway>;
  let notificacionesService: jest.Mocked<NotificacionesService>;

  // Datos de prueba
  const mockCliente = {
    id: 'cliente-1',
    nombre: 'Cliente Test',
    email: 'cliente@example.com',
    empresa: 'Empresa Test S.A.',
  };

  const mockPropietario = {
    id: 'user-1',
    nombre: 'Test User',
    email: 'test@example.com',
    avatarUrl: null,
  };

  const mockNegocio = {
    id: 'negocio-1',
    titulo: 'Negocio Test',
    descripcion: 'Descripción del negocio de prueba',
    valor: 50000,
    moneda: TipoMoneda.MXN,
    etapa: EtapaNegocio.PROSPECTO,
    probabilidad: 50,
    fechaCierreEsperada: new Date('2026-03-01'),
    fechaCierreReal: null,
    clienteId: 'cliente-1',
    propietarioId: 'user-1',
    creadoEn: new Date('2026-01-01'),
    actualizadoEn: new Date('2026-01-01'),
    cerradoEn: null,
    cliente: mockCliente,
    propietario: mockPropietario,
  };

  const mockCreateNegocioDto = {
    titulo: 'Nuevo Negocio',
    descripcion: 'Descripción del nuevo negocio',
    valor: 75000,
    moneda: TipoMoneda.USD,
    etapa: EtapaNegocio.PROPUESTA,
    probabilidad: 60,
    fechaCierreEsperada: '2026-04-01',
    clienteId: 'cliente-1',
    propietarioId: 'user-1',
  };

  const mockUpdateNegocioDto = {
    titulo: 'Negocio Actualizado',
    valor: 80000,
    probabilidad: 75,
  };

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();

    // Mock de NotificacionesGateway
    const mockNotificacionesGateway = {
      emitirNegocioActualizado: jest.fn().mockResolvedValue(undefined),
      emitirNotificacionAUsuario: jest.fn().mockResolvedValue(undefined),
    };

    // Mock de NotificacionesService
    const mockNotificacionesService = {
      crear: jest.fn().mockResolvedValue({
        id: 'notif-1',
        tipo: 'NEGOCIO_ACTUALIZADO',
        titulo: 'Notificación test',
        mensaje: 'Mensaje test',
        leida: false,
        creadoEn: new Date(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NegociosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificacionesGateway,
          useValue: mockNotificacionesGateway,
        },
        {
          provide: NotificacionesService,
          useValue: mockNotificacionesService,
        },
      ],
    }).compile();

    service = module.get<NegociosService>(NegociosService);
    prisma = module.get(PrismaService);
    notificacionesGateway = module.get(NotificacionesGateway);
    notificacionesService = module.get(NotificacionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un negocio con datos válidos', async () => {
      // Arrange
      const usuarioId = 'user-1';
      prisma.cliente.findUnique.mockResolvedValue(mockCliente as any);
      prisma.negocio.create.mockResolvedValue(mockNegocio as any);

      // Act
      const result = await service.create(mockCreateNegocioDto, usuarioId);

      // Assert
      expect(prisma.cliente.findUnique).toHaveBeenCalledWith({
        where: { id: mockCreateNegocioDto.clienteId },
      });
      expect(prisma.negocio.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          titulo: mockCreateNegocioDto.titulo,
          descripcion: mockCreateNegocioDto.descripcion,
          valor: mockCreateNegocioDto.valor,
          moneda: mockCreateNegocioDto.moneda,
          etapa: mockCreateNegocioDto.etapa,
          probabilidad: mockCreateNegocioDto.probabilidad,
          clienteId: mockCreateNegocioDto.clienteId,
          propietarioId: mockCreateNegocioDto.propietarioId,
          fechaCierreEsperada: expect.any(Date),
        }),
        include: expect.objectContaining({
          cliente: expect.any(Object),
          propietario: expect.any(Object),
        }),
      });
      expect(result.titulo).toBe(mockNegocio.titulo);
      expect(result.clienteId).toBe(mockNegocio.clienteId);
    });

    it('debe asignar usuario actual como propietario cuando no se proporciona propietarioId', async () => {
      // Arrange
      const usuarioId = 'user-2';
      const dtoSinPropietario = { ...mockCreateNegocioDto };
      delete dtoSinPropietario.propietarioId;

      prisma.cliente.findUnique.mockResolvedValue(mockCliente as any);
      prisma.negocio.create.mockResolvedValue({
        ...mockNegocio,
        propietarioId: usuarioId,
      } as any);

      // Act
      await service.create(dtoSinPropietario, usuarioId);

      // Assert
      expect(prisma.negocio.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          propietarioId: usuarioId, // Usuario actual
        }),
        include: expect.any(Object),
      });
    });

    it('debe lanzar BadRequestException cuando el cliente no existe', async () => {
      // Arrange
      const usuarioId = 'user-1';
      prisma.cliente.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(mockCreateNegocioDto, usuarioId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(mockCreateNegocioDto, usuarioId)).rejects.toThrow(
        'El cliente especificado no existe',
      );
      expect(prisma.negocio.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debe retornar lista de negocios con paginación', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const negocios = [mockNegocio, { ...mockNegocio, id: 'negocio-2' }];
      prisma.negocio.findMany.mockResolvedValue(negocios as any);
      prisma.negocio.count.mockResolvedValue(2);

      // Act
      const result = await service.findAll(page, limit);

      // Assert
      expect(prisma.negocio.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: limit,
        include: expect.objectContaining({
          cliente: expect.any(Object),
          propietario: expect.any(Object),
        }),
        orderBy: { creadoEn: 'desc' },
      });
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(page);
      expect(result.meta.totalPages).toBe(1);
    });

    it('debe filtrar negocios por búsqueda (título, descripción, cliente)', async () => {
      // Arrange
      const search = 'test';
      prisma.negocio.findMany.mockResolvedValue([mockNegocio] as any);
      prisma.negocio.count.mockResolvedValue(1);

      // Act
      await service.findAll(1, 10, search);

      // Assert
      expect(prisma.negocio.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { titulo: { contains: search, mode: 'insensitive' } },
            { descripcion: { contains: search, mode: 'insensitive' } },
            { cliente: { nombre: { contains: search, mode: 'insensitive' } } },
            { cliente: { empresa: { contains: search, mode: 'insensitive' } } },
          ],
        },
        skip: expect.any(Number),
        take: expect.any(Number),
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('debe filtrar negocios por etapa', async () => {
      // Arrange
      const etapa = EtapaNegocio.PROPUESTA;
      prisma.negocio.findMany.mockResolvedValue([mockNegocio] as any);
      prisma.negocio.count.mockResolvedValue(1);

      // Act
      await service.findAll(1, 10, undefined, etapa);

      // Assert
      expect(prisma.negocio.findMany).toHaveBeenCalledWith({
        where: { etapa },
        skip: expect.any(Number),
        take: expect.any(Number),
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('debe filtrar negocios por propietario', async () => {
      // Arrange
      const propietarioId = 'user-1';
      prisma.negocio.findMany.mockResolvedValue([mockNegocio] as any);
      prisma.negocio.count.mockResolvedValue(1);

      // Act
      await service.findAll(1, 10, undefined, undefined, propietarioId);

      // Assert
      expect(prisma.negocio.findMany).toHaveBeenCalledWith({
        where: { propietarioId },
        skip: expect.any(Number),
        take: expect.any(Number),
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });
  });

  describe('findOne', () => {
    it('debe retornar un negocio por ID', async () => {
      // Arrange
      const negocioId = 'negocio-1';
      prisma.negocio.findUnique.mockResolvedValue(mockNegocio as any);

      // Act
      const result = await service.findOne(negocioId);

      // Assert
      expect(prisma.negocio.findUnique).toHaveBeenCalledWith({
        where: { id: negocioId },
        include: expect.objectContaining({
          cliente: expect.any(Object),
          propietario: expect.any(Object),
        }),
      });
      expect(result.id).toBe(mockNegocio.id);
      expect(result.titulo).toBe(mockNegocio.titulo);
    });

    it('debe lanzar NotFoundException cuando el negocio no existe', async () => {
      // Arrange
      const negocioId = 'negocio-inexistente';
      prisma.negocio.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(negocioId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(negocioId)).rejects.toThrow(
        `Negocio con ID ${negocioId} no encontrado`,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar un negocio exitosamente', async () => {
      // Arrange
      const negocioId = 'negocio-1';
      const usuarioId = 'user-1';
      prisma.negocio.findUnique.mockResolvedValue(mockNegocio as any);
      prisma.negocio.update.mockResolvedValue({
        ...mockNegocio,
        ...mockUpdateNegocioDto,
      } as any);

      // Act
      const result = await service.update(negocioId, mockUpdateNegocioDto, usuarioId);

      // Assert
      expect(prisma.negocio.findUnique).toHaveBeenCalledWith({
        where: { id: negocioId },
      });
      expect(prisma.negocio.update).toHaveBeenCalledWith({
        where: { id: negocioId },
        data: expect.objectContaining(mockUpdateNegocioDto),
        include: expect.any(Object),
      });
      expect(result.titulo).toBe(mockUpdateNegocioDto.titulo);
    });

    it('debe actualizar cerradoEn cuando se cambia a GANADO o PERDIDO', async () => {
      // Arrange
      const negocioId = 'negocio-1';
      const usuarioId = 'user-1';
      const updateDto = { etapa: EtapaNegocio.GANADO };

      prisma.negocio.findUnique.mockResolvedValue(mockNegocio as any);
      prisma.negocio.update.mockResolvedValue({
        ...mockNegocio,
        etapa: EtapaNegocio.GANADO,
        cerradoEn: new Date(),
      } as any);

      // Act
      await service.update(negocioId, updateDto, usuarioId);

      // Assert
      expect(prisma.negocio.update).toHaveBeenCalledWith({
        where: { id: negocioId },
        data: expect.objectContaining({
          etapa: EtapaNegocio.GANADO,
          cerradoEn: expect.any(Date),
        }),
        include: expect.any(Object),
      });
    });

    it('debe lanzar NotFoundException cuando el negocio no existe', async () => {
      // Arrange
      const negocioId = 'negocio-inexistente';
      const usuarioId = 'user-1';
      prisma.negocio.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(negocioId, mockUpdateNegocioDto, usuarioId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(negocioId, mockUpdateNegocioDto, usuarioId)).rejects.toThrow(
        `Negocio con ID ${negocioId} no encontrado`,
      );
      expect(prisma.negocio.update).not.toHaveBeenCalled();
    });
  });

  describe('cambiarEtapa', () => {
    it('debe cambiar la etapa de un negocio exitosamente', async () => {
      // Arrange
      const negocioId = 'negocio-1';
      const nuevaEtapa = EtapaNegocio.NEGOCIACION;
      const usuarioId = 'user-1';

      prisma.negocio.findUnique.mockResolvedValue(mockNegocio as any);
      prisma.negocio.update.mockResolvedValue({
        ...mockNegocio,
        etapa: nuevaEtapa,
      } as any);

      // Act
      const result = await service.cambiarEtapa(negocioId, nuevaEtapa, usuarioId);

      // Assert
      expect(prisma.negocio.update).toHaveBeenCalledWith({
        where: { id: negocioId },
        data: { etapa: nuevaEtapa },
        include: expect.any(Object),
      });
      expect(result.etapa).toBe(nuevaEtapa);
      expect(notificacionesGateway.emitirNegocioActualizado).toHaveBeenCalled();
      expect(notificacionesService.crear).toHaveBeenCalled();
    });

    it('debe actualizar cerradoEn cuando se cambia a GANADO', async () => {
      // Arrange
      const negocioId = 'negocio-1';
      const nuevaEtapa = EtapaNegocio.GANADO;
      const usuarioId = 'user-1';

      prisma.negocio.findUnique.mockResolvedValue(mockNegocio as any);
      prisma.negocio.update.mockResolvedValue({
        ...mockNegocio,
        etapa: nuevaEtapa,
        cerradoEn: new Date(),
      } as any);

      // Act
      const result = await service.cambiarEtapa(negocioId, nuevaEtapa, usuarioId);

      // Assert
      expect(prisma.negocio.update).toHaveBeenCalledWith({
        where: { id: negocioId },
        data: {
          etapa: nuevaEtapa,
          cerradoEn: expect.any(Date),
        },
        include: expect.any(Object),
      });
      expect(notificacionesGateway.emitirNegocioActualizado).toHaveBeenCalledWith(
        negocioId,
        expect.objectContaining({
          etapa: nuevaEtapa,
          etapaAnterior: EtapaNegocio.PROSPECTO,
        }),
      );
      expect(notificacionesService.crear).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'NEGOCIO_GANADO',
        }),
      );
    });

    it('debe actualizar cerradoEn cuando se cambia a PERDIDO', async () => {
      // Arrange
      const negocioId = 'negocio-1';
      const nuevaEtapa = EtapaNegocio.PERDIDO;
      const usuarioId = 'user-1';

      prisma.negocio.findUnique.mockResolvedValue(mockNegocio as any);
      prisma.negocio.update.mockResolvedValue({
        ...mockNegocio,
        etapa: nuevaEtapa,
        cerradoEn: new Date(),
      } as any);

      // Act
      const result = await service.cambiarEtapa(negocioId, nuevaEtapa, usuarioId);

      // Assert
      expect(prisma.negocio.update).toHaveBeenCalledWith({
        where: { id: negocioId },
        data: {
          etapa: nuevaEtapa,
          cerradoEn: expect.any(Date),
        },
        include: expect.any(Object),
      });
      expect(notificacionesService.crear).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'NEGOCIO_PERDIDO',
        }),
      );
    });

    it('debe limpiar cerradoEn cuando se reabre un negocio cerrado', async () => {
      // Arrange
      const negocioId = 'negocio-1';
      const nuevaEtapa = EtapaNegocio.PROPUESTA;
      const usuarioId = 'user-1';
      const negocioCerrado = {
        ...mockNegocio,
        etapa: EtapaNegocio.GANADO,
        cerradoEn: new Date('2026-01-15'),
      };

      prisma.negocio.findUnique.mockResolvedValue(negocioCerrado as any);
      prisma.negocio.update.mockResolvedValue({
        ...negocioCerrado,
        etapa: nuevaEtapa,
        cerradoEn: null,
      } as any);

      // Act
      await service.cambiarEtapa(negocioId, nuevaEtapa, usuarioId);

      // Assert
      expect(prisma.negocio.update).toHaveBeenCalledWith({
        where: { id: negocioId },
        data: {
          etapa: nuevaEtapa,
          cerradoEn: null,
        },
        include: expect.any(Object),
      });
    });

    it('debe lanzar NotFoundException cuando el negocio no existe', async () => {
      // Arrange
      const negocioId = 'negocio-inexistente';
      const nuevaEtapa = EtapaNegocio.PROPUESTA;
      prisma.negocio.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.cambiarEtapa(negocioId, nuevaEtapa)).rejects.toThrow(NotFoundException);
      await expect(service.cambiarEtapa(negocioId, nuevaEtapa)).rejects.toThrow(
        `Negocio con ID ${negocioId} no encontrado`,
      );
      expect(prisma.negocio.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debe eliminar un negocio exitosamente', async () => {
      // Arrange
      const negocioId = 'negocio-1';
      prisma.negocio.findUnique.mockResolvedValue(mockNegocio as any);
      prisma.negocio.delete.mockResolvedValue(mockNegocio as any);

      // Act
      await service.remove(negocioId);

      // Assert
      expect(prisma.negocio.findUnique).toHaveBeenCalledWith({
        where: { id: negocioId },
      });
      expect(prisma.negocio.delete).toHaveBeenCalledWith({
        where: { id: negocioId },
      });
    });

    it('debe lanzar NotFoundException cuando el negocio no existe', async () => {
      // Arrange
      const negocioId = 'negocio-inexistente';
      prisma.negocio.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(negocioId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(negocioId)).rejects.toThrow(
        `Negocio con ID ${negocioId} no encontrado`,
      );
      expect(prisma.negocio.delete).not.toHaveBeenCalled();
    });
  });
});
