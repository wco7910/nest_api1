import { Injectable, Logger } from '@nestjs/common';
import { StudySessions } from 'src/entities/study_sessions.entity';
import { UserPoint } from 'src/entities/user_points.entity';
import { responseObj } from 'src/util/responseObj';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(StudySessions)
    private readonly studySessionRepository: Repository<StudySessions>,
    @InjectRepository(UserPoint)
    private readonly userPointRepository: Repository<UserPoint>,
  ) {}

  /**
   * 최근 7주(이번주 제외, 즉 전주부터 7주 전) 동안
   * child_id에 해당하는 각 카테고리의 클리어 횟수를 주별로 집계하여,
   * 각 카테고리별 결과를 [7주전, 6주전, 5주전, 4주전, 3주전, 2주전, 전주] 순서의 배열로 반환한다.
   *
   * 예시 반환
   * {
   *   english: [1, 1, 2, 4, 5, 6, 7],
   *   block:   [2, 5, 4, 3, 6, 5, 4],
   *   math:    [0, 1, 1, 0, 2, 3, 1],
   *   korean:  [1, 0, 0, 2, 1, 0, 1],
   *   art:     [0, 1, 0, 1, 0, 0, 2]
   * }
   */
  async getStudyLineChart(childId: string) {
    try {
      // 대상 카테고리 목록
      const categories = ['english', 'block', 'math', 'korean', 'art'];

      // 현재 날짜 기준으로 주 경계 계산
      const now = new Date();
      const dayOfWeek = now.getDay();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - dayOfWeek);
      currentWeekStart.setHours(0, 0, 0, 0);

      // 7주 전부터 전주까지의 주간 경계 배열 생성 (0: 7주 전, 6: 전주)
      const weekBoundaries: string[] = [];
      for (let i = 7; i >= 1; i--) {
        const weekStart = new Date(currentWeekStart);
        weekStart.setDate(weekStart.getDate() - 7 * i);
        // PostgreSQL의 DATE_TRUNC('week')는 월요일을 기준으로 주를 시작하므로,
        // 데이터베이스의 결과와 일치하도록 날짜를 조정
        const mondayDate = new Date(weekStart);
        mondayDate.setDate(weekStart.getDate() + 1); // 일요일에서 월요일로 조정
        weekBoundaries.push(mondayDate.toISOString().split('T')[0]);
      }

      // TypeORM QueryBuilder를 사용한 쿼리 작성
      const rawResult = await this.studySessionRepository
        .createQueryBuilder('study_sessions')
        .select([
          'study_sessions.category AS category',
          "DATE_TRUNC('week', study_sessions.created_at) AS week", // 주 단위로 날짜 자르기
          'COUNT(*) AS clear_count', // 각 카테고리별, 주별 row 수 카운트
        ])
        .where('study_sessions.child_id = :childId', { childId })
        .andWhere('study_sessions.category IN (:...categories)', { categories })
        .andWhere(
          "study_sessions.created_at >= DATE_TRUNC('week', NOW()) - INTERVAL '7 week'", // 7주 전부터
        )
        .andWhere("study_sessions.created_at < DATE_TRUNC('week', NOW())") // 이번 주 제외
        .groupBy('study_sessions.category')
        .addGroupBy("DATE_TRUNC('week', study_sessions.created_at)") // 카테고리와 주 단위로 그룹핑
        .orderBy('study_sessions.category')
        .addOrderBy("DATE_TRUNC('week', study_sessions.created_at)")
        .getRawMany();

      // 결과 초기화: 각 카테고리별 7주치 데이터를 0으로 초기화
      const resultMap: { [key: string]: number[] } = {};
      categories.forEach((cat) => {
        resultMap[cat] = new Array(7).fill(0);
      });

      // 쿼리 결과를 주차별 배열로 변환
      rawResult.forEach((row) => {
        const cat = row.category;
        // 별도의 날짜 보정 없이, ISO 문자열의 날짜 부분만 추출
        const weekStr = new Date(row.week).toISOString().split('T')[0];
        const index = weekBoundaries.indexOf(weekStr);
        if (index !== -1) {
          resultMap[cat][index] = parseInt(row.clear_count, 10);
        } else {
          console.log('날짜 매칭 실패:', weekStr, weekBoundaries);
        }
      });

      // 각 카테고리별 평균 점수 계산
      const categoryAverages = Object.entries(resultMap).map(
        ([category, scores]) => {
          const average =
            scores.reduce((sum, score) => sum + score, 0) / scores.length;
          return { category, average };
        },
      );
      // 평균 점수 기준으로 내림차순 정렬하여 상위 2개 선택
      const hasNonZeroAverage = categoryAverages.some(
        (item) => item.average > 0,
      );
      const topCategories = hasNonZeroAverage
        ? categoryAverages
            .sort((a, b) => b.average - a.average)
            .slice(0, 2)
            .map((item) => item.category)
        : [];

      return responseObj.success({
        ...resultMap,
        like: topCategories,
      });
    } catch (e: any) {
      Logger.error(e);
      return responseObj.fail(e.message);
    }
  }

  /**
   * child(또는 profileId)를 기준으로 카테고리별 총 학습 시간(duration의 합)을 집계하여 반환
   * 반환 객체 형식:
   * [
   *   { name: "블럭쌓기", value: 123 },
   *   { name: "미술", value: 456 },
   *   { name: "영어", value: 789 },
   *   { name: "한글", value: 321 },
   *   { name: "수학", value: 654 },
   *   { name: "코딩", value: 987 },
   * ]
   *
   * @param profileId 학습 데이터 조회 대상 child의 프로필 아이디
   */
  async getStudyTotalStatus(profileId: string) {
    try {
      // 내부 카테고리 키와 화면에 표시할 한글 이름 매핑
      const categoryMapping: { [key: string]: string } = {
        english: '영어',
        block: '블럭쌓기',
        math: '수학',
        korean: '한글',
        art: '미술',
        // coding: '코딩',
      };

      // 쿼리할 카테고리 키 목록
      const categories = Object.keys(categoryMapping);

      // TypeORM QueryBuilder를 이용해 child_id와 해당 카테고리 조건에 맞는 총 학습 시간(초)의 합을 구합니다.
      const rawResult = await this.studySessionRepository
        .createQueryBuilder('study_sessions')
        .select('study_sessions.category', 'category')
        .addSelect('SUM(study_sessions.duration)', 'total_duration')
        .where('study_sessions.child_id = :profileId', { profileId })
        .andWhere('study_sessions.category IN (:...categories)', { categories })
        .andWhere('study_sessions.deleted_at IS NULL')
        .groupBy('study_sessions.category')
        .getRawMany();

      // 각 카테고리에 대해 기본값 0으로 초기화
      const resultMap: { [key: string]: number } = {};
      categories.forEach((cat) => {
        resultMap[cat] = 0;
      });

      // 쿼리 결과를 맵에 반영 (SUM 결과는 문자열로 반환될 수 있으므로 parseInt 사용)
      rawResult.forEach((row) => {
        resultMap[row.category] = parseInt(row.total_duration, 10);
      });

      // 최종 결과 배열 구성: 매핑 객체의 순서대로 표시 (필요시 순서를 조정할 수 있음)
      const resultArray = categories.map((cat) => ({
        name: categoryMapping[cat],
        value: resultMap[cat],
      }));

      return responseObj.success(resultArray);
    } catch (e: any) {
      Logger.error(e);
      return responseObj.fail(e.message);
    }
  }

  /**
   * child(profileId)를 기준으로 각 카테고리별 학습 세션 횟수를 집계하여 반환
   * 반환 예시:
   * [
   *   { name: "블럭쌓기", value: 10 },
   *   { name: "미술", value: 40 },
   *   { name: "영어", value: 60 },
   *   { name: "한글", value: 80 },
   *   { name: "수학", value: 120 },
   *   { name: "코딩", value: 160 },
   * ]
   *
   * @param profileId 조회 대상 child의 아이디
   */
  async getTotalCategoryCount(profileId: string) {
    try {
      // 내부 카테고리 키와 화면에 표시할 한글 이름 매핑
      const categoryMapping: { [key: string]: string } = {
        english: '영어',
        block: '블럭쌓기',
        math: '수학',
        korean: '한글',
        art: '미술',
        // coding: '코딩',
      };

      // 쿼리할 카테고리 키 목록
      const categories = Object.keys(categoryMapping);

      // TypeORM QueryBuilder를 이용해 child_id와 카테고리 조건에 맞는 세션 횟수를 집계
      const rawResult = await this.studySessionRepository
        .createQueryBuilder('study_sessions')
        .select('study_sessions.category', 'category')
        .addSelect('COUNT(DISTINCT study_sessions.id)', 'total_count')
        .where('study_sessions.child_id = :profileId', { profileId })
        .andWhere('study_sessions.category IN (:...categories)', { categories })
        .andWhere('study_sessions.deleted_at IS NULL')
        .groupBy('study_sessions.category')
        .getRawMany();

      // 각 카테고리별 기본값 0으로 초기화
      const resultMap: { [key: string]: number } = {};
      categories.forEach((cat) => {
        resultMap[cat] = 0;
      });

      // 쿼리 결과 반영
      rawResult.forEach((row) => {
        resultMap[row.category] = parseInt(row.total_count, 10);
      });

      // 최종 결과 배열 구성
      const resultArray = categories.map((cat) => ({
        name: categoryMapping[cat],
        value: resultMap[cat],
      }));

      return responseObj.success(resultArray);
    } catch (e: any) {
      Logger.error(e);
      return responseObj.fail(e.message);
    }
  }

  /**
   * profileId(ChildrenProfile의 id)를 기준으로 각 포인트 카테고리별 누적 포인트를 집계하여 반환한다.
   * 반환 형식 예:
   * [
   *   { name: "블럭쌓기", value: 10, color: "block" },
   *   { name: "미술", value: 10, color: "art" },
   *   { name: "한글", value: 10, color: "hangeul" },
   *   { name: "영어", value: 10, color: "english" },
   *   { name: "수학", value: 20, color: "math" },
   * ]
   *
   * @param profileId 조회 대상 child의 아이디
   */
  async getUserPointsPieChart(profileId: string) {
    try {
      // 내부 카테고리 키와 화면에 표시할 한글 이름 매핑
      const categoryMapping: {
        [key: string]: { name: string; color: string };
      } = {
        english: { name: '영어', color: 'english' },
        block: { name: '블럭쌓기', color: 'block' },
        math: { name: '수학', color: 'math' },
        korean: { name: '한글', color: 'hangeul' },
        art: { name: '미술', color: 'art' },
      };

      // 쿼리할 카테고리 목록 (getTotalCategoryCount와 동일한 순서 보장)
      const categories = Object.keys(categoryMapping);

      // UserPoint 엔티티에서 profileId(즉, child_id)와 해당 카테고리에 대해 total_points의 합계를 구한다.
      const rawResult = await this.userPointRepository
        .createQueryBuilder('user_point')
        .select('user_point.point_category', 'point_category')
        .addSelect('SUM(user_point.total_points)', 'sum_points')
        .where('user_point.child_id = :profileId', { profileId })
        .andWhere('user_point.point_category IN (:...categories)', {
          categories,
        })
        .groupBy('user_point.point_category')
        .getRawMany();

      // 각 카테고리별 기본값 0으로 초기화
      const resultMap: { [key: string]: number } = {};
      categories.forEach((cat) => {
        resultMap[cat] = 0;
      });

      // 쿼리 결과 반영 (SUM 결과는 문자열일 수 있으므로 parseInt 사용)
      rawResult.forEach((row) => {
        resultMap[row.point_category] = parseInt(row.sum_points, 10);
      });

      // 최종 결과 배열 구성 (getTotalCategoryCount와 동일한 순서 보장)
      const resultArray = categories.map((cat) => ({
        name: categoryMapping[cat].name,
        value: resultMap[cat],
        color: categoryMapping[cat].color,
      }));

      return responseObj.success(resultArray);
    } catch (e: any) {
      Logger.error(e);
      return responseObj.fail(e.message);
    }
  }

  async getDevelopmentScore(profileId: string) {
    try {
      // 내부 카테고리 키와 한글 표기 매핑
      const categoryMapping: { [key: string]: string } = {
        math: '수학',
        block: '블럭쌓기',
        korean: '한글',
        english: '영어',
        art: '미술',
      };
      const categories = Object.keys(categoryMapping);

      // 최근 1달 시작일 (오늘 기준 1달 전, 00:00:00으로 설정)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      oneMonthAgo.setHours(0, 0, 0, 0);

      // 최근 1달 동안의 일 수 (예: 28~31일)
      const now = new Date();
      const diffTime = now.getTime() - oneMonthAgo.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 한 번의 쿼리로 각 카테고리별 집계 데이터를 가져옵니다.
      // - visit_count: 최근 1달 동안의 distinct 방문일수 (하루에 여러 번 방문해도 1일로 계산)
      // - total_duration: 전체 duration(초) 합계
      // - session_count: 전체 세션 수
      const rawResult = await this.studySessionRepository
        .createQueryBuilder('s')
        .select('s.category', 'category')
        .addSelect(
          "COUNT(DISTINCT DATE_TRUNC('day', s.start_time))",
          'visit_count',
        )
        .addSelect('SUM(s.duration)', 'total_duration')
        .addSelect('COUNT(s.id)', 'session_count')
        .where('s.child_id = :childId', { childId: profileId })
        .andWhere('s.category IN (:...categories)', { categories })
        .andWhere('s.start_time >= :oneMonthAgo', { oneMonthAgo })
        .andWhere('s.deleted_at IS NULL')
        .groupBy('s.category')
        .getRawMany();

      // 집계 데이터 초기화 (각 카테고리별 기본값 0)
      const aggMap: {
        [key: string]: {
          visitCount: number;
          totalDuration: number;
          sessionCount: number;
        };
      } = {};
      categories.forEach((cat) => {
        aggMap[cat] = {
          visitCount: 0,
          totalDuration: 0,
          sessionCount: 0,
        };
      });

      console.log('rawResult', rawResult);
      rawResult.forEach((row) => {
        const cat = row.category;
        aggMap[cat] = {
          visitCount: parseInt(row.visit_count, 10) || 0,
          totalDuration: parseInt(row.total_duration, 10) || 0,
          sessionCount: parseInt(row.session_count, 10) || 0,
        };
      });

      // 개별 카테고리별 점수 계산
      // 점수 기준 (예시):
      // [방문 횟수] getVisitScore: 6일 이하 => 1점, 7~12일 => 2점, 13~18일 => 3점, 19~24일 => 4점, 25일 이상 => 5점
      // [평균 사용시간(분)] getUsageScore: 10분 이하 => 1점, 11~20분 => 2점, 21~30분 => 3점, 31~60분 => 4점, 61분 이상 => 5점
      // [평균 진행 횟수] getProgressScore: 2회 이하 => 1점, 3회 이하 => 2점, 4회 이하 => 3점, 5회 이하 => 4점, 5회 초과 => 5점
      // [진행형 정답갯수]: 고정 5점
      const perCategoryScores = categories.map((cat) => {
        const { visitCount, totalDuration, sessionCount } = aggMap[cat];
        const visitScore = this.getVisitScore(visitCount);
        const totalDurationMin = totalDuration / 60; // 초를 분으로 환산
        const avgUsageMin = diffDays > 0 ? totalDurationMin / diffDays : 0;
        const usageScore = this.getUsageScore(avgUsageMin);
        const avgProgressCount = diffDays > 0 ? sessionCount / diffDays : 0;
        const progressScore = this.getProgressScore(avgProgressCount);
        const correctScore = 5; // 진행형 정답갯수 고정
        const totalScore =
          visitScore + usageScore + progressScore + correctScore;
        return {
          categoryKey: cat, // 내부 키 (예: 'math')
          categoryName: categoryMapping[cat], // 한글 표기 (예: '수학')
          visitCount, // 방문 일수
          visitScore, // 방문 횟수 점수 (최대 5점)
          avgUsageMin: parseFloat(avgUsageMin.toFixed(1)), // 1일 평균 사용시간 (분)
          usageScore, // 사용시간 점수 (최대 5점)
          avgProgressCount: parseFloat(avgProgressCount.toFixed(1)), // 1일 평균 진행 횟수
          progressScore, // 진행 횟수 점수 (최대 5점)
          correctScore, // 진행형 정답갯수 (고정 5점)
          totalScore, // 개별 카테고리 총 점수 (최대 20점)
        };
      });

      // 집계 (aggregated) 값 계산
      // logic: 수학 + 블럭쌓기
      // language: 한글 + 영어
      // creativity: 블럭쌓기 + 미술
      // health: 블럭쌓기 + 미술 (요청에 따라 creativity와 동일)
      const mathScore =
        perCategoryScores.find((s) => s.categoryKey === 'math')?.totalScore ||
        0;
      const blockScore =
        perCategoryScores.find((s) => s.categoryKey === 'block')?.totalScore ||
        0;
      const koreanScore =
        perCategoryScores.find((s) => s.categoryKey === 'korean')?.totalScore ||
        0;
      const englishScore =
        perCategoryScores.find((s) => s.categoryKey === 'english')
          ?.totalScore || 0;
      const artScore =
        perCategoryScores.find((s) => s.categoryKey === 'art')?.totalScore || 0;

      const aggregated = {
        logic: mathScore + blockScore,
        language: koreanScore + englishScore,
        creativity: blockScore + artScore,
        exercise: blockScore + artScore,
        sociality: 0,
        emotional: 0,
      };

      // console.log(perCategoryScores);
      // console.log(aggregated);

      return responseObj.success(aggregated);
    } catch (e: any) {
      Logger.error(e);
      return responseObj.fail(e.message);
    }
  }

  /**
   * childId와 category를 받아 해당 카테고리의 최근 1달간 점수를 계산하여 반환
   *
   * @param childId 학습 데이터를 조회할 어린이(프로필) id
   * @param category 내부 카테고리 키 (예: 'math', 'block', 'korean', 'english', 'art')
   * @returns 점수 계산 결과 객체
   */
  async getCategoryScore(childId: string, category: string) {
    try {
      // 카테고리 매핑: 내부 카테고리 키 -> 화면에 표시할 한글명
      const categoryMapping: { [key: string]: string } = {
        block: '블럭쌓기',
        art: '미술',
        korean: '한글',
        english: '영어',
        math: '수학',
      };

      // 전달받은 category가 유효한지 확인
      if (!categoryMapping[category]) {
        return responseObj.fail(`유효하지 않은 카테고리입니다: ${category}`);
      }

      // 최근 1달 시작일 계산 (현재 시각 기준 1달 전, 00:00:00으로 설정)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      oneMonthAgo.setHours(0, 0, 0, 0);

      // 최근 1달 일수 계산 (실제 날짜 차이에 따라 28~31일 등)
      const now = new Date();
      const diffTime = now.getTime() - oneMonthAgo.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 1) 최근 1달 방문 횟수 (Distinct Day Count)
      const recentVisitRaw = await this.studySessionRepository
        .createQueryBuilder('s')
        .select(
          "COUNT(DISTINCT DATE_TRUNC('day', s.start_time))",
          'visit_count',
        )
        .where('s.child_id = :childId', { childId })
        .andWhere('s.category = :cat', { cat: category })
        .andWhere('s.start_time >= :oneMonthAgo', { oneMonthAgo })
        .andWhere('s.deleted_at IS NULL')
        .getRawOne();

      const visitCount = parseInt(recentVisitRaw.visit_count || '0', 10);
      const visitScore = this.getVisitScore(visitCount);

      // 2) 최근 1달 총 사용시간 (초) 집계 → 분 단위로 환산 → 1일 평균 사용시간 계산
      const totalDurationRaw = await this.studySessionRepository
        .createQueryBuilder('s')
        .select('SUM(s.duration)', 'total_duration')
        .where('s.child_id = :childId', { childId })
        .andWhere('s.category = :cat', { cat: category })
        .andWhere('s.start_time >= :oneMonthAgo', { oneMonthAgo })
        .andWhere('s.deleted_at IS NULL')
        .getRawOne();

      const totalDurationSec = parseInt(
        totalDurationRaw.total_duration || '0',
        10,
      );
      const totalDurationMin = totalDurationSec / 60; // 전체 사용시간 (분)
      const avgUsageMin = diffDays > 0 ? totalDurationMin / diffDays : 0; // 1일 평균 사용시간 (분)
      const usageScore = this.getUsageScore(avgUsageMin);

      // 3) 최근 1달 총 진행 횟수 (전체 세션 수) → 1일 평균 진행 횟수 계산
      const totalSessionRaw = await this.studySessionRepository
        .createQueryBuilder('s')
        .select('COUNT(s.id)', 'session_count')
        .where('s.child_id = :childId', { childId })
        .andWhere('s.category = :cat', { cat: category })
        .andWhere('s.start_time >= :oneMonthAgo', { oneMonthAgo })
        .andWhere('s.deleted_at IS NULL')
        .getRawOne();

      const totalSessionCount = parseInt(
        totalSessionRaw.session_count || '0',
        10,
      );
      const avgProgressCount = diffDays > 0 ? totalSessionCount / diffDays : 0;
      const progressScore = this.getProgressScore(avgProgressCount);

      // 4) 진행형 정답갯수: 규칙 미정, 고정 5점
      const correctScore = 5;

      // 최종 점수 (각 항목의 점수 합산; 최대 20점)
      const totalScore = visitScore + usageScore + progressScore + correctScore;

      // 최종 결과 객체 구성
      const result = {
        categoryName: categoryMapping[category], // 예: "수학"
        visitCount, // 최근 1달 방문 일수
        visitScore, // 방문 횟수에 따른 점수 (최대 5점)
        avgUsageMin: parseFloat(avgUsageMin.toFixed(1)), // 1일 평균 사용시간(분)
        usageScore, // 사용시간에 따른 점수 (최대 5점)
        avgProgressCount: parseFloat(avgProgressCount.toFixed(1)), // 1일 평균 진행 횟수
        progressScore, // 진행 횟수에 따른 점수 (최대 5점)
        correctScore, // 진행형 정답갯수 (고정 5점)
        totalScore, // 최종 점수 (최대 20점)
      };

      return responseObj.success(result);
    } catch (e: any) {
      Logger.error(e);
      return responseObj.fail(e.message);
    }
  }

  // 방문 횟수에 따른 점수 변환 함수
  private getVisitScore(visits: number): number {
    if (visits <= 6) return 1;
    if (visits <= 12) return 2;
    if (visits <= 18) return 3;
    if (visits <= 24) return 4;
    return 5;
  }

  // 평균 사용시간(분)에 따른 점수 변환 함수
  private getUsageScore(avgMinutes: number): number {
    if (avgMinutes <= 10) return 1;
    if (avgMinutes <= 20) return 2;
    if (avgMinutes <= 30) return 3;
    if (avgMinutes <= 60) return 4;
    return 5;
  }

  // 1일 평균 진행 횟수에 따른 점수 변환 함수
  private getProgressScore(avgCount: number): number {
    if (avgCount <= 2) return 1;
    if (avgCount <= 3) return 2;
    if (avgCount <= 4) return 3;
    if (avgCount <= 5) return 4;
    return 5;
  }
}
