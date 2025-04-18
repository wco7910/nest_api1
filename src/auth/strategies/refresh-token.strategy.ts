import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.id,
      userId: payload.userId,
      userName: payload.userName,
      storeId: payload.storeId,
      approvalStatus: payload.approvalStatus,
      level: payload.level,
      merchantId: payload?.merchantId,
    };
  }
}
