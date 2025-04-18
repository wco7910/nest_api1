import { Module } from '@nestjs/common';
import { MathContentController } from './math-content.controller';
import { MathContentService } from './math-content.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MathCategorys } from 'src/entities/math_categories.entity';
import { MathLevels } from 'src/entities/math_levels.entity';
import { MathUnits } from 'src/entities/math_units.entity';
import { MathUnitDetails } from 'src/entities/math_unit_details.entity';
import { MathUnitFiles } from 'src/entities/math_unit_files.entity';
import { UserPoint } from 'src/entities/user_points.entity';
import { UserPointHistory } from 'src/entities/user_point_histories.entity';
import { StudySessions } from 'src/entities/study_sessions.entity';
import { MathProgress } from 'src/entities/math_unit_progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MathCategorys,
      MathLevels,
      MathUnits,
      MathUnitDetails,
      MathUnitFiles,
      MathProgress,
      UserPoint,
      UserPointHistory,
      StudySessions,
    ]),
  ],
  controllers: [MathContentController],
  providers: [MathContentService],
})
export class MathContentModule {}
