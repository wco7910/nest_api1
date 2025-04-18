import { Module } from '@nestjs/common';
import { KoreanContentController } from './korean-content.controller';
import { KoreanContentService } from './korean-content.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KoreanCategorys } from 'src/entities/korean_categories.entity';
import { KoreanLevels } from 'src/entities/korean_levels.entity';
import { KoreanUnits } from 'src/entities/korean_units.entity';
import { KoreanProgress } from 'src/entities/korean_unit_progress.entity';
import { UserPoint } from 'src/entities/user_points.entity';
import { UserPointHistory } from 'src/entities/user_point_histories.entity';
import { StudySessions } from 'src/entities/study_sessions.entity';
import { KoreanUnitFiles } from 'src/entities/korean_unit_files.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KoreanCategorys,
      KoreanLevels,
      KoreanUnits,
      KoreanProgress,
      KoreanUnitFiles,
      UserPoint, // 사용자 학습 포인트
      UserPointHistory, // 사용자 포인트 내역
      StudySessions, // 사용자 카테고리 학습 시간
    ]),
  ],
  controllers: [KoreanContentController],
  providers: [KoreanContentService],
})
export class KoreanContentModule {}
