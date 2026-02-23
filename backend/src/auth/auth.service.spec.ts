import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createMockPrismaService, MockPrismaService } from '../testing/prisma.mock';

// Mock de bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: MockPrismaService;
  let jwtService: JwtService;

  // Datos de prueba
  const mockUsuario = {
    id: '1',
    email: 'test@example.com',
    passwordHash: 'hashedPassword123',
    nombre: 'Test User',
    rol: RolUsuario.VENDEDOR,
    avatarUrl: 'https://example.com/avatar.jpg',
    estaActivo: true,
  };

  const mockLoginDto = {
    email: 'test@example.com',
    password: 'Password123!',
  };

  const mockRegisterDto = {
    email: 'newuser@example.com',
    password: 'Password123!',
    nombre: 'New User',
    rol: RolUsuario.VENDEDOR,
    equipoId: 'equipo-1',
  };

  const mockJwtToken = 'mock-jwt-token-12345';

  beforeEach(async () => {
    // Crear mock de PrismaService
    const mockPrismaService = createMockPrismaService();

    // Crear mock de JwtService
    const mockJwtService = {
      sign: jest.fn().mockReturnValue(mockJwtToken),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debe retornar access_token y usuario cuando las credenciales son válidas', async () => {
      // Arrange
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      prisma.usuario.update.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.login(mockLoginDto);

      // Assert
      expect(result).toEqual({
        access_token: mockJwtToken,
        usuario: {
          id: mockUsuario.id,
          email: mockUsuario.email,
          nombre: mockUsuario.nombre,
          rol: mockUsuario.rol,
          avatarUrl: mockUsuario.avatarUrl,
        },
      });

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginDto.email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          nombre: true,
          rol: true,
          avatarUrl: true,
          estaActivo: true,
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUsuario.passwordHash,
      );

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUsuario.id,
        email: mockUsuario.email,
        rol: mockUsuario.rol,
      });
    });

    it('debe actualizar ultimoLogin cuando el login es exitoso', async () => {
      // Arrange
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      prisma.usuario.update.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      await service.login(mockLoginDto);

      // Assert
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: mockUsuario.id },
        data: { ultimoLogin: expect.any(Date) },
      });
    });

    it('debe lanzar UnauthorizedException cuando el usuario no existe', async () => {
      // Arrange
      prisma.usuario.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException cuando la contraseña es incorrecta', async () => {
      // Arrange
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(prisma.usuario.update).not.toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException cuando el usuario está inactivo', async () => {
      // Arrange
      const usuarioInactivo = { ...mockUsuario, estaActivo: false };
      prisma.usuario.findUnique.mockResolvedValue(usuarioInactivo);

      // Act & Assert
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        'Usuario inactivo',
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('debe crear un usuario y retornar access_token cuando los datos son válidos', async () => {
      // Arrange
      const mockCreatedUsuario = {
        id: '2',
        email: mockRegisterDto.email,
        nombre: mockRegisterDto.nombre,
        rol: mockRegisterDto.rol,
        avatarUrl: null,
      };

      prisma.usuario.findUnique.mockResolvedValue(null); // Email no existe
      prisma.usuario.create.mockResolvedValue(mockCreatedUsuario);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');

      // Act
      const result = await service.register(mockRegisterDto);

      // Assert
      expect(result).toEqual({
        access_token: mockJwtToken,
        usuario: {
          id: mockCreatedUsuario.id,
          email: mockCreatedUsuario.email,
          nombre: mockCreatedUsuario.nombre,
          rol: mockCreatedUsuario.rol,
          avatarUrl: undefined, // null se convierte a undefined
        },
      });

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterDto.email },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);

      expect(prisma.usuario.create).toHaveBeenCalledWith({
        data: {
          email: mockRegisterDto.email,
          passwordHash: 'hashedNewPassword',
          nombre: mockRegisterDto.nombre,
          rol: mockRegisterDto.rol,
          equipoId: mockRegisterDto.equipoId,
        },
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
          avatarUrl: true,
        },
      });
    });

    it('debe asignar rol VENDEDOR por defecto si no se proporciona', async () => {
      // Arrange
      const registerDtoSinRol = {
        email: 'test@example.com',
        password: 'Password123!',
        nombre: 'Test User',
        equipoId: 'equipo-1',
      };

      const mockCreatedUsuario = {
        id: '3',
        email: registerDtoSinRol.email,
        nombre: registerDtoSinRol.nombre,
        rol: RolUsuario.VENDEDOR,
        avatarUrl: null,
      };

      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.usuario.create.mockResolvedValue(mockCreatedUsuario);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act
      await service.register(registerDtoSinRol as any);

      // Assert
      expect(prisma.usuario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            rol: RolUsuario.VENDEDOR,
          }),
        }),
      );
    });

    it('debe hashear la contraseña con bcrypt (10 rounds)', async () => {
      // Arrange
      const mockCreatedUsuario = {
        id: '4',
        email: mockRegisterDto.email,
        nombre: mockRegisterDto.nombre,
        rol: mockRegisterDto.rol,
        avatarUrl: null,
      };

      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.usuario.create.mockResolvedValue(mockCreatedUsuario);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      // Act
      await service.register(mockRegisterDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
      expect(prisma.usuario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: 'hashedPassword123',
          }),
        }),
      );
    });

    it('debe lanzar ConflictException cuando el email ya existe', async () => {
      // Arrange
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario); // Email ya existe

      // Act & Assert
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'El email ya está registrado',
      );

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prisma.usuario.create).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('debe retornar usuario cuando el ID es válido y el usuario está activo', async () => {
      // Arrange
      const mockValidUser = {
        id: '1',
        email: 'test@example.com',
        nombre: 'Test User',
        rol: RolUsuario.VENDEDOR,
        avatarUrl: 'https://example.com/avatar.jpg',
        estaActivo: true,
      };

      prisma.usuario.findUnique.mockResolvedValue(mockValidUser);

      // Act
      const result = await service.validateUser('1');

      // Assert
      expect(result).toEqual(mockValidUser);
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
          avatarUrl: true,
          estaActivo: true,
        },
      });
    });

    it('debe retornar null cuando el usuario no existe', async () => {
      // Arrange
      prisma.usuario.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('999');

      // Assert
      expect(result).toBeNull();
    });

    it('debe retornar null cuando el usuario está inactivo', async () => {
      // Arrange
      const mockInactiveUser = {
        id: '1',
        email: 'test@example.com',
        nombre: 'Test User',
        rol: RolUsuario.VENDEDOR,
        avatarUrl: null,
        estaActivo: false,
      };

      prisma.usuario.findUnique.mockResolvedValue(mockInactiveUser);

      // Act
      const result = await service.validateUser('1');

      // Assert
      expect(result).toBeNull();
    });
  });
});
