import { Module } from '@nestjs/common';
import { BlockContentService } from './block-content.service';
import { BlockContentController } from './block-content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockCategorys } from 'src/entities/block_categories.entity';
import { BlockLevels } from 'src/entities/block_levels.entity';
import { BlockUnits } from 'src/entities/block_units.entity';
import { BlockProgress } from 'src/entities/block_progress.entity';
import { UserPointHistory } from 'src/entities/user_point_histories.entity';
import { UserPoint } from 'src/entities/user_points.entity';
import { StudySessions } from 'src/entities/study_sessions.entity';
import { BlockUnitFiles } from 'src/entities/block_unit_files.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlockCategorys,
      BlockLevels,
      BlockUnits,
      BlockUnitFiles,
      BlockProgress,
      UserPointHistory,
      UserPoint,
      StudySessions,
    ]),
  ],
  providers: [BlockContentService],
  controllers: [BlockContentController],
})
export class BlockContentModule {}
