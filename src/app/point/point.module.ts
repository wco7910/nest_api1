import { Module } from '@nestjs/common';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPoint } from 'src/entities/user_points.entity';
import { UserPointHistory } from 'src/entities/user_point_histories.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPoint, UserPointHistory])],
  controllers: [PointController],
  providers: [PointService],
})
export class PointModule {}
