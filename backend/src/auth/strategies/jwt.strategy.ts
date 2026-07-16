import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { getJwtSecret } from '../../common/get-jwt-secret';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(configService.get<string>('JWT_SECRET')),
    });
  }

  async validate(payload: any) {
    const usuario = await this.authService.validateUser(payload.sub);

    if (!usuario) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      rol: payload.rol,
      usuario,
    };
  }
}
