import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { File } from 'src/entities/file.entity';
import { Book } from 'src/entities/books.entity';
import { Travel } from 'src/entities/travel.entity';
import { ParentingCounseling } from 'src/entities/parenting_counseling.entity';
import { Content } from 'src/entities/content.entity';
import { CounselingComment } from 'src/entities/counseling_comment.entity';
import { ExpertProfile } from 'src/entities/expert_profile.entity';
import { BoardLike } from 'src/entities/board_likes.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      File,
      Book,
      Travel,
      ParentingCounseling,
      Content,
      CounselingComment,
      ExpertProfile,
      BoardLike,
    ]),
  ],
  providers: [CommunityService],
  controllers: [CommunityController],
})
export class CommunityModule {}
