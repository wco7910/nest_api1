import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
// import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DiagnosticTestService } from './diagnostic-test.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequestWithUser } from 'src/types/requestWithUser.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
// import { Interval } from '@nestjs/schedule';
// import axios from 'axios';
// import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
// import { RequestWithUser } from 'src/types/requestWithUser.types';

@Controller('diagnostic-test')
export class DiagnosticTestController {
  constructor(private readonly diagnosticTestService: DiagnosticTestService) {}

  // @ApiOperation({ summary: '맞춤 진단테스트 메인' })
  // @ApiResponse({ status: 200, type: Array })
  // @Get('/main')
  // main() {
  //   return this.diagnosticTestService.main();
  // }

  @ApiOperation({ summary: '맞춤 진단테스트 메인' })
  @ApiResponse({ status: 200, type: Array })
  @Post('/main')
  main(@Body() body: { profileId: string; age: string }) {
    const { profileId, age } = body;
    return this.diagnosticTestService.main(profileId, age);
  }

  @ApiOperation({ summary: '맞춤 진단테스트 질문' })
  @ApiResponse({ status: 200, type: Array })
  @Post('/question')
  question(@Body() body: { testId: string; profileId: string; age: string }) {
    const { testId, profileId, age } = body;
    return this.diagnosticTestService.question(testId, profileId, age);
  }

  @Post('/complete')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: '진단 테스트 최종 완료 및 결과 저장' })
  saveResult(@Body() body: any[], @Req() req: RequestWithUser) {
    const { id: userUUID } = req.user;
    const { profile_id } = req.headers;
    return this.diagnosticTestService.completeTest(body, userUUID, profile_id);
  }

  // @ApiOperation({ summary: '맞춤 진단테스트 유저 답변' })
  // @ApiResponse({ status: 200, type: Array })
  // @Post('/response')
  // response(@Body() body: { data: any }) {
  //   const { data } = body;
  //   console.log(data);
  //   return this.diagnosticTestService.response(data);
  // }

  @ApiOperation({ summary: '맞춤 진단테스트 임시저장' })
  @ApiResponse({ status: 200, type: Array })
  @Post('/response')
  @UseGuards(AccessTokenGuard)
  saveResponse(@Body() body: any, @Req() req: RequestWithUser) {
    const { id: userUUID } = req.user;
    const { profile_id } = req.headers;
    return this.diagnosticTestService.saveResponse(body, userUUID, profile_id);
  }

  @ApiOperation({ summary: '맞춤 진단테스트 FAQ' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/faq')
  faq() {
    return this.diagnosticTestService.faq();
  }

  @ApiOperation({ summary: '맞춤 진단테스트 전문의' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/doctor')
  doctor() {
    return this.diagnosticTestService.doctor();
  }

  @ApiOperation({ summary: '맞춤 진단테스트 최근 세션' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/recent-session/:testId')
  @UseGuards(AccessTokenGuard)
  getRecentSession(
    @Param('testId') testId: string,
    @Req() req: RequestWithUser,
  ) {
    const { id: userUUID } = req.user;
    const { profile_id } = req.headers;
    return this.diagnosticTestService.getRecentSession(
      testId,
      profile_id,
      userUUID,
    );
  }

  @ApiOperation({ summary: '맞춤 진단테스트 세션 삭제' })
  @ApiResponse({ status: 200, type: Array })
  @Delete('/session/:sessionId')
  async deleteSession(@Param('sessionId') sessionId: string) {
    return this.diagnosticTestService.deleteSessionAndAnswers(sessionId);
  }

  @ApiOperation({ summary: '맞춤 진단테스트 세션 재시작' })
  @ApiResponse({ status: 200, type: Array })
  @Post('/restart-session')
  @UseGuards(AccessTokenGuard)
  restartSession(
    @Body() body: { profileId: string; testId: string; sessionId: string },
    @Req() req: RequestWithUser,
  ) {
    const { testId, sessionId } = body;
    const { profile_id } = req.headers;
    return this.diagnosticTestService.restartSession(
      testId,
      sessionId,
      profile_id,
    );
  }

  // @Interval(5000)
  // async handleInterval() {
  //   console.log('interval');

  //   try {

  //     const randomNumber = Math.floor(Math.random() * 100) + 1;
  //     const response = await axios.get('http://localhost:3003/no-proxy/test', {
  //       params: { data: randomNumber }
  //     });

  //     console.log('응답 데이터:', response.data);
  //   } catch (error) {
  //     console.error('HTTP 요청 실패:', error);
  //   }
  // }
}
