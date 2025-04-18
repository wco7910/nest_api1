import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.contoller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { AdminUser } from 'src/entities/admin_user.entity';
import { PurchaseVerification } from 'src/entities/purchaseverification.entity';
import { VisitLog } from 'src/entities/visit_log.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      AdminUser,
      PurchaseVerification,
      VisitLog,
    ]),
  ],
  providers: [
    LocalStrategy,
    JwtService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AuthService,
  ],
  controllers: [AuthController],
  // exports: [TypeOrmModule],
})
export class AuthModule {}
