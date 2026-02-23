import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const mockExecutionContext = (user: any, roles?: RolUsuario[]): ExecutionContext => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    if (roles) {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles);
    } else {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    }

    return context;
  };

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      const context = mockExecutionContext({ userId: '1', rol: RolUsuario.VENDEDOR });
      
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has required role (ADMIN)', () => {
      const context = mockExecutionContext(
        { userId: '1', rol: RolUsuario.ADMIN },
        [RolUsuario.ADMIN],
      );

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const context = mockExecutionContext(
        { userId: '1', rol: RolUsuario.MANAGER },
        [RolUsuario.ADMIN, RolUsuario.MANAGER],
      );

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      const context = mockExecutionContext(
        { userId: '1', rol: RolUsuario.VENDEDOR },
        [RolUsuario.ADMIN],
      );

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Acceso denegado. Se requiere uno de estos roles: ADMIN',
      );
    });

    it('should deny access when user is not authenticated', () => {
      const context = mockExecutionContext(null, [RolUsuario.ADMIN]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Usuario no autenticado');
    });

    it('should deny access when VENDEDOR tries to access ADMIN-only route', () => {
      const context = mockExecutionContext(
        { userId: '1', rol: RolUsuario.VENDEDOR },
        [RolUsuario.ADMIN],
      );

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny access when VENDEDOR tries to access MANAGER-only route', () => {
      const context = mockExecutionContext(
        { userId: '1', rol: RolUsuario.VENDEDOR },
        [RolUsuario.MANAGER],
      );

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
