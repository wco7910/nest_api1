import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtContentController } from './art-content.controller';
import { ArtContentService } from './art-content.service';
import { ArtCategorys } from 'src/entities/art_categories.entity';
import { ArtLevels } from 'src/entities/art_levels.entity';
import { ArtUnits } from 'src/entities/art_units.entity';
import { ArtProgress } from 'src/entities/art_progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtCategorys, ArtLevels, ArtUnits, ArtProgress]),
  ],
  providers: [ArtContentService],
  controllers: [ArtContentController],
})
export class ArtContentModule {}
