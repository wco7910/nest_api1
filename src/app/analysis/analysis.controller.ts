import { Controller, Get, Query } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @ApiOperation({
    summary: '마이페이지 > 학습현황 > 라인차트 데이터(최근 7주)',
  })
  @ApiResponse({ status: 200, type: Array })
  @Get('/study/line-chart')
  getStudyLineChart(@Query('profileId') profileId: string) {
    return this.analysisService.getStudyLineChart(profileId);
  }

  @ApiOperation({
    summary: '마이페이지 > 학습현황 > 총 학습 현황 > Pie Chart',
  })
  @ApiResponse({ status: 200, type: Array })
  @Get('/study/total-status')
  getStudyTotalStatus(@Query('profileId') profileId: string) {
    return this.analysisService.getStudyTotalStatus(profileId);
  }

  @ApiOperation({
    summary: '마이페이지 > 학습현황 > 총 학습 현황 > 카테고리별 총 학습 횟수',
  })
  @ApiResponse({ status: 200, type: Array })
  @Get('/study/total-category-count')
  getTotalCategoryCount(@Query('profileId') profileId: string) {
    return this.analysisService.getTotalCategoryCount(profileId);
  }

  @ApiOperation({
    summary: '마이페이지 > 학습현황 > 전체 블럭지수 살펴보기',
  })
  @ApiResponse({ status: 200, type: Array })
  @Get('/study/block-index')
  getUserPointsPieChart(@Query('profileId') profileId: string) {
    return this.analysisService.getUserPointsPieChart(profileId);
  }

  @ApiOperation({
    summary: '마이페이지 > 발달현황 > 발달점수 계산',
  })
  @ApiResponse({ status: 200, type: Array })
  @Get('/study/development-score')
  getDevelopmentScore(@Query('profileId') profileId: string) {
    return this.analysisService.getDevelopmentScore(profileId);
  }
}
