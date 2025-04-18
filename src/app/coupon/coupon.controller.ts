import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { RequestWithUser } from 'src/types/requestWithUser.types';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @ApiOperation({
    summary: '하위 자녀들의 쿠폰 총합 조회',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/')
  getChildCouponCount(@Req() req: RequestWithUser) {
    const { id: userUUID } = req.user;
    return this.couponService.getChildCouponCount(userUUID);
  }

  @ApiOperation({
    summary:
      '전체 자녀의 [ 쿠폰 총합 , 쿠폰 히스토리 ] - 나의 보유 쿠폰 페이지',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/history')
  getAllCouponHistory(@Req() req: RequestWithUser) {
    const { id: userUUID } = req.user;
    return this.couponService.getAllCouponHistory(userUUID);
  }

  @ApiOperation({
    summary: '선택한 자녀의 쿠폰 총합 조회',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/:childId')
  getSelectedChildCouponCount(
    @Req() req: RequestWithUser,
    @Param('childId') childId: string,
  ) {
    const { id: userUUID } = req.user;
    return this.couponService.getSelectedChildCouponCount(userUUID, childId);
  }

  @ApiOperation({
    summary:
      '선택한 자녀의 [ 포인트 총합 , 포인트 히스토리 ] - 나의 보유 포인트 페이지',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/history/:childId')
  getCouponHistory(
    @Req() req: RequestWithUser,
    @Param('childId') childId: string,
  ) {
    const { id: userUUID } = req.user;
    return this.couponService.getCouponHistory(userUUID, childId);
  }
}
