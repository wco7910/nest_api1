import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { AdminStrokeService } from './stroke.service';
import { ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';

@Controller('admin/stroke')
export class AdminStrokeController {
  constructor(private readonly adminStrokeService: AdminStrokeService) {}

  @Get('/')
  getStroke() {
    return this.adminStrokeService.getStroke();
  }

  @ApiOperation({ summary: '쓰기 탭 쓰기 획순 업데이트' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @Put('/:unitDetailId')
  updateStroke(
    @Param('unitDetailId') unitDetailId: number,
    @Body() body: any,
  ) {
    return this.adminStrokeService.updateStroke(unitDetailId, body);
  }
}
