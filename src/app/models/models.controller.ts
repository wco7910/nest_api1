import {
  Controller,
  NotFoundException,
  Get,
  Header,
  Res,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import * as fs from 'fs-extra';
import * as NodeCache from 'node-cache';

@Controller('models')
export class ModelsController {
  private uploadsDir = join(process.cwd(), './uploads/block');
  private compressedDir = join(process.cwd(), './compressed');
  private cache = new NodeCache({ stdTTL: 3600 }); // 캐시 TTL 설정

  constructor() {
    fs.ensureDirSync(this.compressedDir);
  }

  @Get('/:glbFileName')
  @Header('Content-Type', 'model/gltf-binary')
  async getModelFile(
    @Res() res: Response,
    @Param('glbFileName') glbFileName: string,
  ) {
    try {
      const filePath = join(this.uploadsDir, glbFileName);
      const compressedFileName = `compressed-${glbFileName}`;
      const compressedFilePath = join(this.compressedDir, compressedFileName);

      Logger.log('파일 압축 시작');
      // Check if the original file exists
      if (!existsSync(filePath)) {
        throw new NotFoundException('모델 파일을 찾을 수 없습니다.');
      }

      // Check cache for compressed file
      const cachedPath = this.cache.get<string>(glbFileName);
      if (cachedPath) {
        return res.sendFile(cachedPath);
      }

      // If compressed file doesn't exist, create it
      if (!existsSync(compressedFilePath)) {
        await this.compressGLBFile(filePath, compressedFilePath);
      }

      // Cache the file path
      this.cache.set(glbFileName, compressedFilePath);

      // Send the compressed file
      Logger.log('파일 압축 완료');
      return res.sendFile(compressedFilePath);
    } catch (error) {
      throw new HttpException(
        '파일 처리 중 문제가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private compressGLBFile(
    inputPath: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // 최대 압축 옵션 적용
      // --draco.compressionLevel: 압축 레벨 (1-10, 기본값 7)
      // --draco.quantizePositionBits: 위치 정보 양자화 비트 (기본값 14)
      // --draco.quantizeNormalBits: 법선 벡터 양자화 비트 (기본값 10)
      // --draco.quantizeTexcoordBits: 텍스처 좌표 양자화 비트 (기본값 12)
      // --draco.quantizeColorBits: 색상 양자화 비트 (기본값 8)
      // --draco.quantizeGenericBits: 기타 속성 양자화 비트 (기본값 12)
      const command = `gltf-pipeline -i ${inputPath} -o ${outputPath} \
        --draco.compressMeshes \
        --draco.compressionLevel 10 \
        --draco.quantizePositionBits 11 \
        --draco.quantizeNormalBits 8 \
        --draco.quantizeTexcoordBits 10 \
        --draco.quantizeColorBits 8 \
        --draco.quantizeGenericBits 8`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.log(error);
          console.error('압축 오류:', stderr);
          return reject(error);
        }
        console.log('압축 성공:', stdout);
        resolve();
      });
    });
  }
}
