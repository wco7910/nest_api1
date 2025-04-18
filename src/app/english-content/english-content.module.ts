import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnglishCategorys } from 'src/entities/english_categories.entity';
import { EnglishLevels } from 'src/entities/english_levels.entity';
import { EnglishUnits } from 'src/entities/english_units.entity';
import { EnglishContentController } from './english-content.controller';
import { EnglishContentService } from './english-content.service';
import { EnglishProgress } from 'src/entities/english_unit_progress.entity';
import { UserPoint } from 'src/entities/user_points.entity';
import { UserPointHistory } from 'src/entities/user_point_histories.entity';
import { StudySessions } from 'src/entities/study_sessions.entity';
import { EnglishUnitFiles } from 'src/entities/english_unit_files.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EnglishCategorys,
      EnglishLevels,
      EnglishUnits,
      EnglishProgress,
      EnglishUnitFiles,
      UserPoint,
      UserPointHistory,
      StudySessions,
    ]),
  ],
  controllers: [EnglishContentController],
  providers: [EnglishContentService],
})
export class EnglishContentModule {}
