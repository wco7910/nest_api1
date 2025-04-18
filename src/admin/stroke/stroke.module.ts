import { Module } from '@nestjs/common';
import { AdminStrokeController } from './stroke.controller';
import { AdminStrokeService } from './stroke.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KoreanUnitDetails } from 'src/entities/korean_unit_details.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KoreanUnitDetails])],
  providers: [AdminStrokeService],
  controllers: [AdminStrokeController],
})
export class AdminStrokeModule {}
