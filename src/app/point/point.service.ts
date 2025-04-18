import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPointHistory } from 'src/entities/user_point_histories.entity';
import { UserPoint } from 'src/entities/user_points.entity';
import { Repository } from 'typeorm';
import { responseObj } from 'src/util/responseObj';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(UserPoint)
    private readonly userPointRepository: Repository<UserPoint>,
    @InjectRepository(UserPointHistory)
    private readonly userPointHistoryRepository: Repository<UserPointHistory>,
  ) {}

  /** 하위 자녀들의 모든 포인트 총합 조회 */
  async getChildPoint(userUUID: string) {
    const point = await this.userPointRepository.find({
      where: {
        user: { id: userUUID },
      },
    });

    const totalPoints = point.reduce((acc, curr) => acc + curr.total_points, 0);
    return responseObj.success(totalPoints);
  }

  /** 선택한 자녀의 프로필의 모든 학습 포인트 총합 조회 */
  async getSelectedChildPoint(userUUID: string, childId: string) {
    const point = await this.userPointRepository.find({
      where: {
        child: {
          id: childId,
        },
        user: {
          id: userUUID,
        },
      },
    });

    const totalPoints = point.reduce((acc, curr) => acc + curr.total_points, 0);
    return responseObj.success(totalPoints);
  }

  /** 전체 자녀의 포인트 총합, 포인트 히스토리리 조회 */
  async getAllPointHistory(userUUID: string) {
    /** 1. 포인트 총합 조회 */
    const point = await this.userPointRepository.find({
      where: {
        user: { id: userUUID },
      },
    });

    // 총합 합산 : return : number
    const totalPoints: number = point.reduce(
      (acc, curr) => acc + curr.total_points,
      0,
    );

    /** 2. 포인트 히스토리 리스트 */
    const pointHistory: UserPointHistory[] =
      await this.userPointHistoryRepository.find({
        where: {
          user: { id: userUUID },
        },
        order: {
          created_at: 'DESC',
        },
      });

    return responseObj.success({
      totalPoints: totalPoints,
      pointHistory: pointHistory,
    });
  }

  /** 포인트 히스토리 조회 */
  async getPointHistory(userUUID: string, childId: string) {
    /** 1. 포인트 총합 조회 */
    const point = await this.userPointRepository.find({
      where: {
        child: {
          id: childId,
        },
        user: {
          id: userUUID,
        },
      },
    });
    // 총합 합산 : return : number
    const totalPoints: number = point.reduce(
      (acc, curr) => acc + curr.total_points,
      0,
    );

    /** 2. 포인트 히스토리 리스트 */
    const pointHistory: UserPointHistory[] =
      await this.userPointHistoryRepository.find({
        where: {
          child: { id: childId },
          user: { id: userUUID },
        },
        order: {
          created_at: 'DESC',
        },
      });

    console.log({
      totalPoints: totalPoints,
      pointHistory: pointHistory,
    });
    return responseObj.success({
      totalPoints: totalPoints,
      pointHistory: pointHistory,
    });
  }

  /** 선택한 자녀의 프로필의 학습별(블럭, 한글, 영어,,)포인트 현황 조회 */
  async getSelectedChildCategoryPoint(
    userUUID: string,
    childId: string,
    pointCategory: string,
  ) {
    try {
      console.log('userUUID', userUUID);
      console.log('childId', childId);

      const point = await this.userPointRepository.findOne({
        where: {
          child: {
            id: childId,
          },
          user: {
            id: userUUID,
          },
          point_category: pointCategory,
        },
      });
      console.log(point, 'point');

      if (!point) {
        return responseObj.fail('포인트 정보를 찾을 수 없습니다.');
      }

      if (!point.total_points) {
        return responseObj.success(0); // 포인트가 없으면 0 반환
      }

      return responseObj.success(point.total_points);
    } catch (e: any) {
      Logger.error(`${e.message}`, 'getSelectedChildProfileCategoryPoint');
      return responseObj.fail(e.message);
    }
  }
}
