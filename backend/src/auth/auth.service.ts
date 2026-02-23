import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Buscar usuario por email
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: loginDto.email },
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

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.estaActivo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(loginDto.password, usuario.passwordHash);
    
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() },
    });

    // Generar JWT
    const payload = { 
      sub: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol 
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        avatarUrl: usuario.avatarUrl ?? undefined,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear usuario
    const usuario = await this.prisma.usuario.create({
      data: {
        email: registerDto.email,
        passwordHash: hashedPassword,
        nombre: registerDto.nombre,
        rol: registerDto.rol || 'VENDEDOR',
        equipoId: registerDto.equipoId,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        avatarUrl: true,
      },
    });

    // Generar JWT
    const payload = { 
      sub: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol 
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        avatarUrl: usuario.avatarUrl ?? undefined,
      },
    };
  }

  async validateUser(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        avatarUrl: true,
        estaActivo: true,
      },
    });

    if (!usuario || !usuario.estaActivo) {
      return null;
    }

    return usuario;
  }
}
