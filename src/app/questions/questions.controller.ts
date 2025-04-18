import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { RequestWithUser } from 'src/types/requestWithUser.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { AddQuestionDto } from './dto/addQuestionDto.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  /** 카테고리별 자주묻는 질문 조회 */
  @ApiOperation({
    summary: '나의 1:1 문의 내역',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @Get('/')
  @UseGuards(AccessTokenGuard)
  async getMyQuestions(@Req() req: RequestWithUser) {
    const { id: userUUID } = req.user;
    return this.questionsService.getMyQuestions(userUUID);
  }

  /** 카테고리별 자주묻는 질문 조회 */
  @ApiOperation({
    summary: '1:1 문의 추가',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @UseGuards(AccessTokenGuard)
  @Post('/')
  async addQuestion(
    @Body() addQuestionDto: AddQuestionDto,
    @Req() req: RequestWithUser,
  ) {
    const { id: userUUID } = req.user;
    return this.questionsService.addQuestion(userUUID, addQuestionDto);
  }

  /** 카테고리별 자주묻는 질문 조회 */
  @ApiOperation({
    summary: '카테고리별 자주묻는 질문 조회',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @Get('/category/:category')
  async getCategoryQuestions(@Param('category') category: string) {
    return this.questionsService.getCategoryQuestions(category);
  }
}
