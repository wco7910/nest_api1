import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockCategorys } from 'src/entities/block_categories.entity';
import { BlockLevels } from 'src/entities/block_levels.entity';
import { BlockProgress } from 'src/entities/block_progress.entity';
import { BlockUnitFiles } from 'src/entities/block_unit_files.entity';
import { BlockUnits } from 'src/entities/block_units.entity';
import { StudySessions } from 'src/entities/study_sessions.entity';
import { UserPointHistory } from 'src/entities/user_point_histories.entity';
import { UserPoint } from 'src/entities/user_points.entity';
import { responseObj } from 'src/util/responseObj';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class BlockContentService {
  constructor(
    @InjectRepository(BlockCategorys)
    private readonly blockCategoryRepository: Repository<BlockCategorys>,
    @InjectRepository(BlockLevels)
    private readonly blockLevelRepository: Repository<BlockLevels>,
    @InjectRepository(BlockUnits)
    private readonly blockUnitRepository: Repository<BlockUnits>,
    @InjectRepository(BlockProgress)
    private readonly blockProgressRepository: Repository<BlockProgress>,
    @InjectRepository(BlockUnitFiles)
    private readonly blockFilesRepository: Repository<BlockUnitFiles>,
    @InjectRepository(UserPoint)
    private readonly userPointRepository: Repository<UserPoint>,
    @InjectRepository(UserPointHistory)
    private readonly userPointHistoryRepository: Repository<UserPointHistory>,
    @InjectRepository(StudySessions)
    private readonly studySessionsRepository: Repository<StudySessions>,
    private readonly dataSource: DataSource,
  ) {}

  async getBlockCategory(categoryId: string) {
    try {
      const blockCategory = await this.blockCategoryRepository.find({
        select: ['id', 'name', 'icon_path'],
        where: {
          is_use: true,
        },
        order: {
          sort: 'ASC',
        },
      });

      return responseObj.success(blockCategory);
    } catch (e: any) {
      Logger.error(`${e.message}`, 'getBlockCategory');
      return responseObj.fail(e.message);
    }
  }

  async getBlockLevels(categoryId: string) {
    try {
      const levels = await this.blockLevelRepository.find({
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

  async getBlockUnits(getBlockData: { levelId: string; profile_id: string }) {
    try {
      const units = await this.blockUnitRepository.find({
        where: {
          level: { id: getBlockData.levelId },
        },
        relations: ['files'],
        order: {
          unit_number: 'ASC',
          files: {
            sort: 'ASC',
          },
        },
      });

      // 선택한 프로필마다 얻어오는 타이머 값
      const progresses = await this.blockProgressRepository.find({
        where: {
          child_profile: {
            id: getBlockData.profile_id,
          },
        },
        relations: ['unit'],
      });

      // 각 유닛의 files를 타입에 따라 분류
      const modifiedUnits = units.map((unit) => {
        const imageFiles = unit.files.filter((file) => file.type === 'image');
        const threeDFiles = unit.files.filter((file) => file.type === '3d');
        const progressData = progresses.filter((progress) => {
          return progress.unit.id === unit.id;
        });
        const unitMainImage =
          imageFiles.length != 0 ? imageFiles.at(-1).path : ''; // 이미지 파일이 없을 시, 빈 값으로 들고 오도록

        return {
          id: unit.id,
          unit_number: unit.unit_number,
          unit_title: unit.unit_title,
          unit_type: unit.unit_type, // 타입을 통해 UI를 다르게 표현
          unit_point: unit.unit_point,
          unit_subject: unit.unit_subject,
          files: imageFiles, // type이 'image'인 파일들만
          is_3d: threeDFiles.length > 0, // 3D 파일이 하나라도 있으면 true
          files_3d: threeDFiles, // type이 '3d'인 파일들만
          progress_data: progressData, // 사용자의 완료된 유닛과 시간을 가져오기 위함
          unit_main_image: unitMainImage,
        };
      });

      return responseObj.success(modifiedUnits);
    } catch (e: any) {
      console.log('@@ ERROR: ', e.message);
      return responseObj.fail(e.message);
    }
  }

  async addBlockLevel(categoryId: string, level: number): Promise<any> {
    try {
      const category = await this.blockCategoryRepository.findOne({
        where: { id: categoryId },
      });
      const newLevel = this.blockLevelRepository.create({ level, category });
      const result = await this.blockLevelRepository.save(newLevel);

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async addBlockUnit(
    levelId: string,
    unitData: Partial<BlockUnits>,
  ): Promise<any> {
    try {
      console.log('levelId', levelId);
      console.log('unitData', unitData);
      const level = await this.blockLevelRepository.findOne({
        where: { id: levelId },
      });
      const newUnit = this.blockUnitRepository.create({ ...unitData, level });
      const result = await this.blockUnitRepository.save(newUnit);
      return responseObj.success(result);
    } catch (e: any) {
      console.error('Error adding block unit:', e);
      return responseObj.fail(e.message);
    }
  }

  async saveUserTime(userTimeData: {
    elapsed_time: number;
    unit_id: string;
    point_category: string;
    start_time: Date;
    end_time: Date;
    duration: number;
    profile_id: string;
    user_id: string;
  }): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('userTimeData', userTimeData);
      // 해당 유닛에 대한 클리어 정보가 있는지 확인
      const isExistUserTime = await this.blockProgressRepository.findOne({
        where: {
          unit: {
            id: userTimeData.unit_id,
          },
          child_profile: {
            id: userTimeData.profile_id,
          },
        },
      });

      /** 지금 클리어한 유닛 정보를 읽어와서 포인트 얼마 더해야 하는지 계산  */
      const unitInfo = await this.blockUnitRepository.findOne({
        where: {
          id: userTimeData.unit_id,
        },
      });
      console.log(unitInfo, 'unitInfo');

      // 처음 클리어한 경우에만 포인트 추가
      if (!isExistUserTime) {
        Logger.log('처음 클리어!!');
        // 포인트 총합 조회
        const userPoint = await this.userPointRepository.findOne({
          where: {
            child: { id: userTimeData.profile_id },
            user: { id: userTimeData.user_id },
            point_category: userTimeData.point_category, //  카테고리 조회
          },
        });
        console.log(userPoint, 'userPoint');
        const rewardPoints = unitInfo.unit_point; // 보상 포인트 값 설정
        console.log(rewardPoints, 'rewardPoints');
        if (userPoint) {
          await this.userPointRepository.update(userPoint.id, {
            total_points: userPoint.total_points + rewardPoints,
          });
        } else {
          await this.userPointRepository.save({
            child: { id: userTimeData.profile_id },
            user: { id: userTimeData.user_id },
            point_category: userTimeData.point_category,
            total_points: rewardPoints,
          });
        }

        // 포인트 히스토리 추가
        const pointHistory = await this.userPointHistoryRepository.save({
          child: { id: userTimeData.profile_id },
          user: { id: userTimeData.user_id },
          point_category: userTimeData.point_category,
          point_change: rewardPoints,
          description: `${userTimeData.point_category} 완료 보상`,
        });

        // 학습 시간 기록 저장
        await this.studySessionsRepository.save({
          child: { id: userTimeData.profile_id },
          pointHistory: { id: pointHistory.id },
          category: userTimeData.point_category,
          unit_id: userTimeData.unit_id,
          start_time: userTimeData.start_time,
          end_time: userTimeData.end_time,
          duration: userTimeData.duration,
          earned_points: unitInfo.unit_point,
        });
      } else {
        Logger.log('두번째 클리어!!');
        // 학습 시간 기록 저장
        await this.studySessionsRepository.save({
          child: { id: userTimeData.profile_id },
          category: userTimeData.point_category,
          unit_id: userTimeData.unit_id,
          start_time: userTimeData.start_time,
          end_time: userTimeData.end_time,
          duration: userTimeData.duration,
        });
      }

      // 학습 완료 저장
      const result = await this.blockProgressRepository.save({
        ...isExistUserTime,
        is_cleared: true,
        elapsed_time: userTimeData.elapsed_time,
        unit: { id: userTimeData.unit_id },
        child_profile: { id: userTimeData.profile_id },
      });

      return responseObj.success(result);
    } catch (e: any) {
      console.error('Error save user block unit time:', e);
      return responseObj.fail(e.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getBlockFiles() {
    try {
      const blockFiles = await this.blockFilesRepository.find({
        order: {
          sort: 'ASC',
        },
      });

      console.log('@@ BLOCK: ', blockFiles);

      return responseObj.success(blockFiles);
    } catch (e: any) {
      console.error('Error Block File List:', e);
      return responseObj.fail(e.message);
    }
  }
}
