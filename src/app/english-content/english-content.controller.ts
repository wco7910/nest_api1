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
import { EnglishContentService } from './english-content.service';
import { EnglishUnits } from 'src/entities/english_units.entity';
import { join } from 'path';
import { Response } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RequestWithUser } from 'src/types/requestWithUser.types';

@Controller('english-content')
export class EnglishContentController {
  constructor(private readonly englishContentService: EnglishContentService) {}

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

    return this.englishContentService.saveUserTime({
      ...UserCompleteData,
      profile_id: profile_id,
      user_id: req.user.id,
    });
  }

  @ApiOperation({ summary: '영어 상단 카테고리 리스트' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  // @UseGuards(AccessTokenGuard)
  @Get('/:categoryId')
  getEnglishCategory(@Param('categoryId') categoryId: string) {
    return this.englishContentService.getEnglishCategory(categoryId);
  }

  @ApiOperation({ summary: '영어 카테고리에 해당하는 레벨 리스트' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @Get('/levels/:categoryId')
  getEnglishLevels(@Param('categoryId') categoryId: string) {
    return this.englishContentService.getEnglishLevels(categoryId);
  }

  @ApiOperation({ summary: '영어 레벨에 해당하는 유닛 리스트' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @Get('/units/:levelId')
  getEnglishUnits(
    @Req() req: RequestWithUser,
    @Param('levelId') levelId: string,
  ) {
    const { profile_id } = req.headers;
    return this.englishContentService.getEnglishUnits({
      levelId: levelId,
      profile_id: profile_id,
    });
  }

  @ApiOperation({ summary: '새로운 레벨 추가' })
  @ApiResponse({ status: 201, description: '새로운 레벨 추가 성공' })
  @Post('/levels/:categoryId')
  addEnglishLevel(
    @Param('categoryId') categoryId: string,
    @Body() body: { level: number },
  ) {
    return this.englishContentService.addEnglishLevel(categoryId, body.level);
  }

  @ApiOperation({ summary: '새로운 유닛 추가' })
  @ApiResponse({ status: 201, description: '새로운 유닛 추가 성공' })
  @Post('/units/:levelId')
  addEnglishUnit(
    @Param('levelId') levelId: string,
    @Body() unitData: Partial<EnglishUnits>,
  ) {
    return this.englishContentService.addEnglishUnit(levelId, unitData);
  }

  @ApiOperation({ summary: '영어 카테고리의 전체 파일' })
  @ApiResponse({
    status: 201,
    description: '영어 카테고리 전체 파일 조회 성공',
  })
  @Get('/files/list')
  getBlockFilList() {
    return this.englishContentService.getEnglishFiles();
  }

  @ApiOperation({ summary: '스트로크 파일 반환' })
  @ApiResponse({ status: 200, description: '스트로크 파일 반환 성공' })
  @Get('/stroke/:filename')
  getStrokeFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'stroke/english', filename);
    return res.sendFile(filePath);
  }

  @ApiOperation({ summary: '이미지 파일 반환' })
  @ApiResponse({ status: 200, description: '이미지 파일 반환 성공' })
  @Get('/img/:filename')
  getEnglishImgFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads/english', filename);
    return res.sendFile(filePath);
  }
}
