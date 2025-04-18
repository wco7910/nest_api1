import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from 'src/entities/topics.entity';
import { UserTopic } from 'src/entities/user_topics.entity';
import { ChildrenProfile } from 'src/entities/children_profile.entity';
import { UserPointHistory } from 'src/entities/user_point_histories.entity';
import { UserPoint } from 'src/entities/user_points.entity';
import { ProfileImageFile } from 'src/entities/profile_image_files.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Topic,
      UserTopic,
      ChildrenProfile,
      UserPointHistory,
      UserPoint,
      UserPointHistory,
      ProfileImageFile,
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
