import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MathContentService } from './math-content.service';
import { MathUnits } from 'src/entities/math_units.entity';
import { join } from 'path';
import { Response } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RequestWithUser } from 'src/types/requestWithUser.types';

@Controller('math-content')
export class MathContentController {
  constructor(private readonly mathContentService: MathContentService) {}

  @ApiOperation({ summary: '사용자 학습 완료 저장' })
  @ApiResponse({ status: 200, description: '사용자 학습 완료 저장 성공' })
  @UseGuards(AccessTokenGuard)
  @Post()
  saveCompletedUnit(
    @Req() req: RequestWithUser,
    @Body()
    UserCompleteData: {
      unit_id: string;
      point_category: string;
      start_time: Date;
      end_time: Date;
      duration: number;
    },
  ) {
    const { profile_id } = req.headers; // 사용자가 선택한 프로필 id

    return this.mathContentService.saveUserTime({
      ...UserCompleteData,
      profile_id: profile_id,
      user_id: req.user.id,
    });
  }

  @ApiOperation({ summary: '블록 맞추기 상단 카테고리 리스트' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  // @UseGuards(AccessTokenGuard)
  @Get('/:categoryId')
  getBlockCategory(@Param('categoryId') categoryId: string) {
    return this.mathContentService.getMathCategory(categoryId);
  }

  @ApiOperation({ summary: '블록 맞추기 카테고리에 해당하는 레벨 리스트' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @Get('/levels/:categoryId')
  getBlockLevels(@Param('categoryId') categoryId: string) {
    return this.mathContentService.getMathLevels(categoryId);
  }

  @ApiOperation({ summary: '블록 맞추기 레벨에 해당하는 유닛 리스트' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @Get('/units/:levelId')
  getBlockUnits(
    @Req() req: RequestWithUser,
    @Param('levelId') levelId: string,
  ) {
    const { profile_id } = req.headers;
    return this.mathContentService.getMathUnits({
      levelId: levelId,
      profile_id: profile_id,
    });
  }

  @ApiOperation({ summary: '새로운 레벨 추가' })
  @ApiResponse({ status: 201, description: '새로운 레벨 추가 성공' })
  @Post('/levels/:categoryId')
  addBlockLevel(
    @Param('categoryId') categoryId: string,
    @Body() body: { level: number },
  ) {
    return this.mathContentService.addMathLevel(categoryId, body.level);
  }

  @ApiOperation({ summary: '새로운 유닛 추가' })
  @ApiResponse({ status: 201, description: '새로운 유닛 추가 성공' })
  @Post('/units/:levelId')
  addBlockUnit(
    @Param('levelId') levelId: string,
    @Body() unitData: Partial<MathUnits>,
  ) {
    return this.mathContentService.addMathUnit(levelId, unitData);
  }

  @ApiOperation({ summary: '수학 카테고리의 전체 파일' })
  @ApiResponse({
    status: 201,
    description: '수학 카테고리 전체 파일 조회 성공',
  })
  @Get('/files/list')
  getBlockFilList() {
    return this.mathContentService.getMathFiles();
  }

  @ApiOperation({ summary: '이미지 파일 반환' })
  @ApiResponse({ status: 200, description: '스트로크 파일 반환 성공' })
  @Get('/img/:filename')
  getMathImgFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads/math', filename);
    return res.sendFile(filePath);
  }

  @ApiOperation({ summary: '스트로크 파일 반환' })
  @ApiResponse({ status: 200, description: '스트로크 파일 반환 성공' })
  @Get('/stroke/:filename')
  getStrokeFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'stroke/math', filename);
    return res.sendFile(filePath);
  }
}
