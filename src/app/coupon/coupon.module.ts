import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { UserCoupon } from 'src/entities/user_coupon.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserCoupon])],
  providers: [CouponService],
  controllers: [CouponController],
})
export class CouponModule {}
