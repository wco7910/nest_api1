import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { StudySessions } from 'src/entities/study_sessions.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPoint } from 'src/entities/user_points.entity';
@Module({
  imports: [TypeOrmModule.forFeature([StudySessions, UserPoint])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
