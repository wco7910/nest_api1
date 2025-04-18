import { Injectable, Logger } from '@nestjs/common';
import { UserCoupon } from 'src/entities/user_coupon.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { responseObj } from 'src/util/responseObj';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(UserCoupon)
    private readonly userCouponRepository: Repository<UserCoupon>,
  ) {}

  /** 하위 자녀들의 쿠폰 총합 조회 */
  async getChildCouponCount(userUUID: string) {
    try {
      const coupon = await this.userCouponRepository.count({
        where: {
          user: { id: userUUID },
        },
      });

      return responseObj.success(coupon);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async getAllCouponHistory(userUUID: string) {
    try {
      Logger.log(userUUID, 'userUUID');
      /** 1. 포인트 히스토리 리스트 */
      const couponHistory: UserCoupon[] = await this.userCouponRepository.find({
        relations: ['coupon'],
        where: {
          user: {
            id: userUUID,
          },
        },
        order: {
          created_at: 'DESC',
        },
      });
      Logger.log(couponHistory, 'couponHistory');
      /** 2. 포인트 히스토리 총 갯수 */
      const couponCount = couponHistory.length;

      return responseObj.success({
        totalCoupon: couponCount,
        couponHistory: couponHistory,
      });
    } catch (e: any) {
      console.log(e, 'e');
      return responseObj.fail(e.message);
    }
  }

  /** 선택한 자녀 프로필의 쿠폰 갯수 조회 */
  async getSelectedChildCouponCount(userUUID: string, childId: string) {
    try {
      const coupon = await this.userCouponRepository.count({
        where: {
          child: { id: childId },
          user: { id: userUUID },
        },
      });

      console.log(coupon, 'coupon');
      return responseObj.success(coupon);
    } catch (e: any) {
      console.log(e, 'e');
      return responseObj.fail(e.message);
    }
  }

  /** 포인트 히스토리 조회 */
  async getCouponHistory(userUUID: string, childId: string) {
    try {
      Logger.log(childId, 'childId');
      Logger.log(userUUID, 'userUUID');
      /** 1. 포인트 히스토리 리스트 */
      const couponHistory: UserCoupon[] = await this.userCouponRepository.find({
        relations: ['coupon'],
        where: {
          child: {
            id: childId,
          },
          user: {
            id: userUUID,
          },
        },
        order: {
          created_at: 'DESC',
        },
      });
      Logger.log(couponHistory, 'couponHistory');
      /** 2. 포인트 히스토리 총 갯수 */
      const couponCount = couponHistory.length;

      return responseObj.success({
        totalCoupon: couponCount,
        couponHistory: couponHistory,
      });
    } catch (e: any) {
      console.log(e, 'e');
      return responseObj.fail(e.message);
    }
  }
}
