import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KoreanCategorys } from 'src/entities/korean_categories.entity';
import { KoreanLevels } from 'src/entities/korean_levels.entity';
import { KoreanUnitFiles } from 'src/entities/korean_unit_files.entity';
import { KoreanProgress } from 'src/entities/korean_unit_progress.entity';
import { KoreanUnits } from 'src/entities/korean_units.entity';
import { StudySessions } from 'src/entities/study_sessions.entity';
import { UserPointHistory } from 'src/entities/user_point_histories.entity';
import { UserPoint } from 'src/entities/user_points.entity';
import { responseObj } from 'src/util/responseObj';
import { DataSource, Not, Repository } from 'typeorm';

@Injectable()
export class KoreanContentService {
  constructor(
    @InjectRepository(KoreanCategorys)
    private readonly koreanCategoryRepository: Repository<KoreanCategorys>,
    @InjectRepository(KoreanLevels)
    private readonly koreanLevelRepository: Repository<KoreanLevels>,
    @InjectRepository(KoreanUnits)
    private readonly koreanUnitRepository: Repository<KoreanUnits>,
    @InjectRepository(KoreanProgress)
    private readonly koreanProgressRepository: Repository<KoreanProgress>,
    @InjectRepository(KoreanUnitFiles)
    private readonly koreanFilesRepository: Repository<KoreanUnitFiles>,
    private readonly dataSource: DataSource,
  ) {}

  async getKoreanCategory(categoryId: string) {
    try {
      const koreanCategory = await this.koreanCategoryRepository.find({
        select: ['id', 'name'],
        order: {
          sort: 'ASC',
        },
      });

      return responseObj.success(koreanCategory);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async getKoreanLevels(categoryId: string) {
    try {
      const levels = await this.koreanLevelRepository.find({
        where: { category: { id: categoryId } },
        select: ['id', 'level', 'level_title'],
        order: {
          level: 'ASC',
        },
      });

      return responseObj.success(levels);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async getKoreanUnits(getKoreanData: { levelId: string; profile_id: string }) {
    const unitMainImages = []; // unit_main_img 값들을 모아둘 리스트

    try {
      const units = await this.koreanUnitRepository.find({
        where: { level: { id: getKoreanData.levelId } },
        // select: ['id', 'unit_number', 'unit_title'],
        relations: ['unitDetails', 'unitDetails.files'],
        order: {
          unit_number: 'ASC',
          unitDetails: {
            unit_sort: 'ASC',
            files: {
              sort: 'ASC',
            },
          },
        },
      });

      // 선택한 프로필마다 얻어오는 타이머 값
      const progresses = await this.koreanProgressRepository.find({
        where: {
          child_profile: {
            id: getKoreanData.profile_id,
          },
        },
        relations: ['unit'],
      });

      // 각 유닛의 files를 유닛의 배우기, 익히기, 쓰기 타입에 따라 분류
      const modifiedUnits = units.map((unit) => {
        // 학습 상태에 대한 데이터
        const progressData = progresses.filter((progress) => {
          return progress.unit.id === unit.id;
        });

        // 배우기에 대한 데이터
        const learnData = unit.unitDetails.filter(
          (learn) => learn.unit_tab_name === 'learn',
        );
        // 익히기에 대한 데이터
        const getData = unit.unitDetails.filter(
          (getUnitData) => getUnitData.unit_tab_name === 'get',
        );
        // 쓰기에 대한 데이터
        const writeData = unit.unitDetails.filter(
          (write) => write.unit_tab_name === 'write',
        );

        const learnFiles = unit.unitDetails
          .filter((learn) => learn.unit_tab_name === 'learn')
          .flatMap((learnFile) => learnFile.files); // unit_detail 테이블의 unit_tab_name이 learn(배우기)에 해당하는 파일들

        const getFiles = unit.unitDetails
          .filter((getData) => getData.unit_tab_name === 'get')
          .flatMap((getFile) => getFile.files); // unit_detail 테이블의 unit_tab_name이 get(익히기)에 해당하는 파일들

        // const writeFiles = unit.unitDetails
        //   .filter((writeData) => writeData.unit_tab_name === 'write')
        //   .flatMap((writeFile) => writeFile.files); // unit_detail 테이블의 unit_tab_name이 write(쓰기)에 해당하는 파일들

        unitMainImages.push(unit.unit_main_img);

        return {
          id: unit.id,
          unit_number: unit.unit_number,
          unit_title: unit.unit_title,
          unit_point: unit.unit_point,
          unit_main_img: unit.unit_main_img, // 썸네일 이미지 불러오기
          progress_data: progressData, // 사용자의 완료된 유닛을 가져오기 위함
          learn_data: learnData,
          get_data: getData,
          write_data: writeData,
          learn_files: learnFiles, // unit_type이 learn(배우기)에 해당하는 파일들
          get_files: getFiles, // unit_type이 get(배우기)에 해당하는 파일들
          write_files: [], // 필요 없어서 임시 빈 배열 처리
        };
      });

      Logger.log(modifiedUnits);
      return responseObj.success(modifiedUnits);
    } catch (e: any) {
      console.log('@@ E: ', e);
      return responseObj.fail(e.message);
    }
  }

  async addKoreanLevel(categoryId: string, level: number): Promise<any> {
    try {
      const category = await this.koreanCategoryRepository.findOne({
        where: { id: categoryId },
      });
      const newLevel = this.koreanLevelRepository.create({ level, category });
      const result = await this.koreanLevelRepository.save(newLevel);

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async addKoreanUnit(
    levelId: string,
    unitData: Partial<KoreanUnits>,
  ): Promise<any> {
    try {
      console.log('levelId', levelId);
      console.log('unitData', unitData);
      const level = await this.koreanLevelRepository.findOne({
        where: { id: levelId },
      });
      const newUnit = this.koreanUnitRepository.create({ ...unitData, level });
      const result = await this.koreanUnitRepository.save(newUnit);
      return responseObj.success(result);
    } catch (e: any) {
      console.error('Error adding block unit:', e);
      return responseObj.fail(e.message);
    }
  }

  async saveUserTime(userTimeData: {
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
      Logger.log('userTimeData', userTimeData);

      // 해당 유닛에 대한 클리어 정보가 있는지 확인
      const isExistUserTime = await queryRunner.manager.findOne(
        KoreanProgress,
        {
          where: {
            unit: {
              id: userTimeData.unit_id,
            },
            child_profile: {
              id: userTimeData.profile_id,
            },
          },
        },
      );

      // 지금 클리어한 유닛 정보를 읽어와서 포인트 얼마 더해야 하는지 계산
      const unitInfo = await queryRunner.manager.findOne(KoreanUnits, {
        where: {
          id: userTimeData.unit_id,
        },
      });

      Logger.log(unitInfo, 'unitInfo');

      // 처음 클리어한 경우에만 포인트 추가
      if (!isExistUserTime) {
        Logger.log('처음 클리어!!');

        // 포인트 총합 조회
        const userPoint = await queryRunner.manager.findOne(UserPoint, {
          where: {
            child: { id: userTimeData.profile_id },
            user: { id: userTimeData.user_id },
            point_category: userTimeData.point_category,
          },
        });

        Logger.log(userPoint, 'userPoint');
        const rewardPoints = unitInfo.unit_point; // 보상 포인트 값 설정

        if (userPoint) {
          await queryRunner.manager.update(UserPoint, userPoint.id, {
            total_points: userPoint.total_points + rewardPoints,
          });
        } else {
          await queryRunner.manager.save(UserPoint, {
            child: { id: userTimeData.profile_id },
            user: { id: userTimeData.user_id },
            point_category: userTimeData.point_category,
            total_points: rewardPoints,
          });
        }

        // 포인트 히스토리 추가
        const pointHistory = await queryRunner.manager.save(UserPointHistory, {
          child: { id: userTimeData.profile_id },
          user: { id: userTimeData.user_id },
          point_category: userTimeData.point_category,
          point_change: rewardPoints,
          description: `${userTimeData.point_category} 완료 보상`,
        });

        // 학습 시간 기록 저장
        await queryRunner.manager.save(StudySessions, {
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
        await queryRunner.manager.save(StudySessions, {
          child: { id: userTimeData.profile_id },
          category: userTimeData.point_category,
          unit_id: userTimeData.unit_id,
          start_time: userTimeData.start_time,
          end_time: userTimeData.end_time,
          duration: userTimeData.duration,
        });
      }

      // 학습 완료 저장
      const result = await queryRunner.manager.save(KoreanProgress, {
        ...isExistUserTime,
        is_cleared: true,
        unit: { id: userTimeData.unit_id },
        child_profile: { id: userTimeData.profile_id },
      });

      await queryRunner.commitTransaction();
      return responseObj.success(result);
    } catch (e: any) {
      console.error('Error save user block unit time:', e);
      return responseObj.fail(e.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getKoreanFiles() {
    try {
      const koreanAllImgFiles = await this.koreanFilesRepository.find({
        where: {
          unitDetails: {
            unit_tab_name: Not('write'),
          },
        },
        relations: ['unitDetails', 'unitDetails.units'],
        order: {
          unitDetails: {
            units: {
              unit_number: 'ASC',
            },
          },
          sort: 'ASC',
        },
      });

      const koreanAllWriteFiles = await this.koreanFilesRepository.find({
        where: {
          unitDetails: {
            unit_tab_name: 'write',
          },
        },
        relations: ['unitDetails', 'unitDetails.units'],
        order: {
          unitDetails: {
            units: {
              unit_number: 'ASC',
            },
          },
          sort: 'ASC',
        },
      });

      const koreanUnitMainImg = await this.koreanUnitRepository.find({
        select: ['unit_main_img'],
        order: {
          unit_number: 'ASC',
        },
      });

      return responseObj.success([
        {
          korean_files: koreanAllImgFiles,
          korean_write_files: koreanAllWriteFiles,
          korean_main_image_files: koreanUnitMainImg,
        },
      ]);
    } catch (e: any) {
      console.error('Error Block File List:', e);
      return responseObj.fail(e.message);
    }
  }
}
