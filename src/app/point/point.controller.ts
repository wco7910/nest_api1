import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { PointService } from './point.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RequestWithUser } from 'src/types/requestWithUser.types';

@Controller('point')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @ApiOperation({
    summary: '하위 자녀들의의 포인트 총합 조회',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/')
  getChildPoint(@Req() req: RequestWithUser) {
    const { id: userUUID } = req.user;

    return this.pointService.getChildPoint(userUUID);
  }

  @ApiOperation({
    summary:
      '전체 자녀의 [ 포인트 총합 , 포인트 히스토리 ] - 나의 보유 포인트 페이지',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/history')
  getAllPointHistory(@Req() req: RequestWithUser) {
    const { id: userUUID } = req.user;
    return this.pointService.getAllPointHistory(userUUID);
  }

  @ApiOperation({
    summary: '선택한 자녀의 포인트 총합 조회',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/:childId')
  getSelectedChildProfilePoint(
    @Req() req: RequestWithUser,
    @Param('childId') childId: string,
  ) {
    const { id: userUUID } = req.user;

    return this.pointService.getSelectedChildPoint(userUUID, childId);
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
  getPointHistory(
    @Req() req: RequestWithUser,
    @Param('childId') childId: string,
  ) {
    const { id: userUUID } = req.user;
    return this.pointService.getPointHistory(userUUID, childId);
  }

  @ApiOperation({
    summary:
      '선택한 자녀의 프로필의 학습별(블럭, 한글, 영어,,)포인트 현황 조회',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/category/:pointCategory/:childId')
  getSelectedChildProfileCategoryPoint(
    @Req() req: RequestWithUser,
    @Param('pointCategory') pointCategory: string,
    @Param('childId') childId: string,
  ) {
    const { id: userUUID } = req.user;
    console.log(pointCategory, 'pointCategory');
    console.log(childId, 'childId');

    return this.pointService.getSelectedChildCategoryPoint(
      userUUID,
      childId,
      pointCategory,
    );
  }
}
