import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtCategorys } from 'src/entities/art_categories.entity';
import { ArtLevels } from 'src/entities/art_levels.entity';
import { ArtProgress } from 'src/entities/art_progress.entity';
import { ArtUnits } from 'src/entities/art_units.entity';
// import { StudySessions } from 'src/entities/study_sessions.entity';
// import { UserPointHistory } from 'src/entities/user_point_histories.entity';
// import { UserPoint } from 'src/entities/user_points.entity';
import { responseObj } from 'src/util/responseObj';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ArtContentService {
  constructor(
    @InjectRepository(ArtCategorys)
    private readonly artCategoryRepository: Repository<ArtCategorys>,
    @InjectRepository(ArtLevels)
    private readonly artLevelRepository: Repository<ArtLevels>,
    @InjectRepository(ArtUnits)
    private readonly artUnitRepository: Repository<ArtUnits>,
    @InjectRepository(ArtProgress)
    private readonly artProgressRepository: Repository<ArtProgress>,
    private readonly dataSource: DataSource,
  ) {}

  async getArtCategory(categoryId: string) {
    try {
      const artCategory = await this.artCategoryRepository.find({
        select: ['id', 'name', 'icon_path'],
        order: {
          sort: 'ASC',
        },
      });
      return responseObj.success(artCategory);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async getArtLevels(categoryId: string) {
    try {
      const levels = await this.artLevelRepository.find({
        where: { category: { id: categoryId } },
        select: ['id', 'level'],
        order: {
          level: 'ASC',
        },
      });
      console.log('levels', levels);
      return responseObj.success(levels);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async getArtUnits(getArtData: { levelId: string; profile_id: string }) {
    try {
      const units = await this.artUnitRepository.find({
        where: {
          level: { id: getArtData.levelId },
        },
        select: ['id', 'unit_number', 'unit_title', 'unit_type'],
        relations: ['files'],
        order: {
          unit_number: 'ASC',
          files: {
            sort: 'ASC',
          },
        },
      });

      // 선택한 프로필마다 얻어오는 타이머 값
      const progresses = await this.artProgressRepository.find({
        where: {
          child_profile: {
            id: getArtData.profile_id,
          },
        },
        relations: ['unit'],
      });

      // 각 유닛의 files를 타입에 따라 분류
      const modifiedUnits = units.map((unit) => {
        const imageFiles = unit.files.filter((file) => file.type === 'image');
        const progressData = progresses.filter(
          (progress) => progress.unit.id === unit.id,
        );

        return {
          id: unit.id,
          unit_number: unit.unit_number,
          unit_title: unit.unit_title,
          unit_type: unit.unit_type, // 타입을 통해 UI를 다르게 표현
          files: imageFiles, // type이 'image'인 파일들만
          progress_data: progressData, // 사용자의 완료된 유닛과 시간을 가져오기 위함
        };
      });

      Logger.log(modifiedUnits);

      return responseObj.success(modifiedUnits);
    } catch (e: any) {
      console.log('@@ ERROR: ', e.message);
      return responseObj.fail(e.message);
    }
  }

  async addArtLevel(categoryId: string, level: number): Promise<any> {
    try {
      const category = await this.artCategoryRepository.findOne({
        where: { id: categoryId },
      });
      const newLevel = this.artLevelRepository.create({ level, category });
      const result = await this.artLevelRepository.save(newLevel);

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async addArtUnit(levelId: string, unitData: Partial<ArtUnits>): Promise<any> {
    try {
      console.log('levelId', levelId);
      console.log('unitData', unitData);
      const level = await this.artLevelRepository.findOne({
        where: { id: levelId },
      });
      const newUnit = this.artUnitRepository.create({ ...unitData, level });
      const result = await this.artUnitRepository.save(newUnit);
      return responseObj.success(result);
    } catch (e: any) {
      console.error('Error adding block unit:', e);
      return responseObj.fail(e.message);
    }
  }

  async saveUserTime(userTimeData: {
    unit_id: string;
    profile_id: string;
    is_cleared: boolean;
    user_file_path: string;
    point_category: string;
    user_id: string;
  }): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 해당 유닛에 대한 클리어 정보가 있는지 확인
      const isExistUserTime = await queryRunner.manager.findOne(ArtProgress, {
        where: {
          unit: {
            id: userTimeData.unit_id,
          },
          child_profile: {
            id: userTimeData.profile_id,
          },
        },
      });

      // 지금 클리어한 유닛 정보를 읽어와서 포인트 얼마 더해야 하는지 계산
      const unitInfo = await queryRunner.manager.findOne(ArtUnits, {
        where: {
          id: userTimeData.unit_id,
        },
      });

      Logger.log(unitInfo, 'unitInfo');

      // // 처음 클리어한 경우에만 포인트 추가
      // if (!isExistUserTime) {
      //   Logger.log('처음 클리어!!');

      //   // 포인트 총합 조회
      //   const userPoint = await queryRunner.manager.findOne(UserPoint, {
      //     where: {
      //       child: { id: userTimeData.profile_id },
      //       user: { id: userTimeData.user_id },
      //       point_category: userTimeData.point_category,
      //     },
      //   });

      //   Logger.log(userPoint, 'userPoint');
      //   const rewardPoints = unitInfo.unit_point; // 보상 포인트 값 설정

      //   if (userPoint) {
      //     await queryRunner.manager.update(UserPoint, userPoint.id, {
      //       total_points: userPoint.total_points + rewardPoints,
      //     });
      //   } else {
      //     await queryRunner.manager.save(UserPoint, {
      //       child: { id: userTimeData.profile_id },
      //       user: { id: userTimeData.user_id },
      //       point_category: userTimeData.point_category,
      //       total_points: rewardPoints,
      //     });
      //   }

      //   // 포인트 히스토리 추가
      //   const pointHistory = await queryRunner.manager.save(UserPointHistory, {
      //     child: { id: userTimeData.profile_id },
      //     user: { id: userTimeData.user_id },
      //     point_category: userTimeData.point_category,
      //     point_change: rewardPoints,
      //     description: `${userTimeData.point_category} 완료 보상`,
      //   });

      //   // 학습 시간 기록 저장
      //   await queryRunner.manager.save(StudySessions, {
      //     child: { id: userTimeData.profile_id },
      //     pointHistory: { id: pointHistory.id },
      //     category: userTimeData.point_category,
      //     unit_id: userTimeData.unit_id,
      //     start_time: userTimeData.start_time,
      //     end_time: userTimeData.end_time,
      //     duration: userTimeData.duration,
      //     earned_points: unitInfo.unit_point,
      //   });
      // } else {
      //   Logger.log('두번째 클리어!!');
      //   // 학습 시간 기록 저장
      //   await queryRunner.manager.save(StudySessions, {
      //     child: { id: userTimeData.profile_id },
      //     category: userTimeData.point_category,
      //     unit_id: userTimeData.unit_id,
      //     start_time: userTimeData.start_time,
      //     end_time: userTimeData.end_time,
      //     duration: userTimeData.duration,
      //   });
      // }

      // 선택한 프로필 사용자가 해당 유닛에 대한 클리어 값이 존재하면 update, 아니면 insert
      const result = await queryRunner.manager.save(ArtProgress, {
        ...isExistUserTime,
        is_cleared: userTimeData.is_cleared,
        user_file_path: userTimeData.user_file_path,
        unit: {
          id: userTimeData.unit_id,
        },
        child_profile: {
          id: userTimeData.profile_id,
        },
      });

      await queryRunner.commitTransaction();

      console.log('@@ RESULT: ', result);

      return responseObj.success(result);
    } catch (e: any) {
      console.error('Error save user block unit time:', e);
      return responseObj.fail(e.message);
    } finally {
      await queryRunner.release();
    }
  }
}
