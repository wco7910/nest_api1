import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ArtContentService } from './art-content.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequestWithUser } from 'src/types/requestWithUser.types';
import { join } from 'path';
import { Response } from 'express';
import { ArtUnits } from 'src/entities/art_units.entity';
import { multerDiskOptions } from 'src/common/multerOptions';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';

@Controller('art-content')
export class ArtContentController {
  constructor(private readonly artContentService: ArtContentService) {}

  @ApiOperation({ summary: '미술 상단 카테고리 리스트' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  // @UseGuards(AccessTokenGuard)
  @Get('/:categoryId')
  getArtCategory(@Param('categoryId') categoryId: string) {
    return this.artContentService.getArtCategory(categoryId);
  }

  @ApiOperation({ summary: '미술 카테고리에 해당하는 레벨 리스트' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @Get('/levels/:categoryId')
  getArtLevels(@Param('categoryId') categoryId: string) {
    return this.artContentService.getArtLevels(categoryId);
  }

  @ApiOperation({ summary: '미술 레벨에 해당하는 유닛 리스트' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @Get('/units/:levelId')
  getArtUnits(@Req() req: RequestWithUser, @Param('levelId') levelId: string) {
    const { profile_id } = req.headers;

    return this.artContentService.getArtUnits({
      levelId: levelId,
      profile_id: profile_id,
    });
  }

  @ApiOperation({ summary: '새로운 레벨 추가' })
  @ApiResponse({ status: 201, description: '새로운 레벨 추가 성공' })
  @Post('/levels/:categoryId')
  addArtLevel(
    @Param('categoryId') categoryId: string,
    @Body() body: { level: number },
  ) {
    return this.artContentService.addArtLevel(categoryId, body.level);
  }

  @ApiOperation({ summary: '새로운 유닛 추가' })
  @ApiResponse({ status: 201, description: '새로운 유닛 추가 성공' })
  @Post('/units/:levelId')
  addArtUnit(
    @Param('levelId') levelId: string,
    @Body() unitData: Partial<ArtUnits>,
  ) {
    return this.artContentService.addArtUnit(levelId, unitData);
  }

  @ApiOperation({ summary: '사용자 색칠 완료 저장' })
  @ApiResponse({ status: 200, description: '사용자 색칠 완료 저장 성공' })
  @Post()
  saveUserTimer(
    @Req() req,
    @Body()
    userTimeData: {
      unit_id: string;
      is_cleared: boolean;
      user_file_path: string;
      point_category: string;
    },
  ) {
    try {
      const { profile_id } = req.headers; // 사용자가 선택한 프로필 id

      return this.artContentService.saveUserTime({
        ...userTimeData,
        profile_id: profile_id,
        user_id: req.user.id,
      });
    } catch (e) {
      console.log('@@ E: ', e);
    }
  }

  @ApiOperation({ summary: '이미지 파일 반환' })
  @ApiResponse({ status: 200, description: '스트로크 파일 반환 성공' })
  @Get('/img/:filename')
  getArtImgFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads/art', filename);
    return res.sendFile(filePath);
  }

  @ApiOperation({ summary: '이미지 저장' })
  @ApiResponse({ status: 200, description: '이미지 저장 완료' })
  @UseInterceptors(FilesInterceptor('svgData', null, multerDiskOptions))
  @Post('/save/svg')
  saveUserImg(@Req() req) {
    const svgData = req.body.svg_data;
    const fileName = req.body.fileName;

    if (!svgData) {
      return { message: 'svg_data가 없습니다.' };
    }

    const filePath = `./uploads/art/${fileName}.svg`;

    // 기존 파일이 존재하면 삭제 후 다시 저장할 수 있도록
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return fs.writeFileSync(filePath, svgData, 'utf8');
  }
}
