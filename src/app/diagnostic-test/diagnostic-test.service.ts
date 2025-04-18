import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { responseObj } from 'src/util/responseObj';
import { File } from 'src/entities/file.entity';
import { DiagnosticTest } from 'src/entities/diagnostic_tests.entity';
import { DiagnosticQuestion } from 'src/entities/diagnostic_questions.entity';
import { DiagnosticResponse } from 'src/entities/diagnostic_responses.entity';
import { Faq } from 'src/entities/faq.entity';
import { Doctor } from 'src/entities/doctor.entity';
import { v4 as uuidv4 } from 'uuid';
import { DiagnosticResult } from 'src/entities/diagnostic_results.entity';
import { DiagnosticHistory } from 'src/entities/diagnostic_history.entity';
@Injectable()
export class DiagnosticTestService {
  constructor(
    @InjectRepository(DiagnosticTest)
    private readonly diagnosticTestRepository: Repository<DiagnosticTest>,
    @InjectRepository(DiagnosticQuestion)
    private readonly diagnosticQuestionRepository: Repository<DiagnosticQuestion>,
    @InjectRepository(DiagnosticResponse)
    private readonly diagnosticResponseRepository: Repository<DiagnosticResponse>,
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(DiagnosticResult)
    private readonly diagnosticResultRepository: Repository<DiagnosticResult>,
    @InjectRepository(DiagnosticHistory)
    private readonly diagnosticHistoryRepository: Repository<DiagnosticHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async main(profileId: string, age: string) {
    try {
      const baseQuery = this.diagnosticTestRepository
        .createQueryBuilder('test')
        .leftJoin(File, 'file', 'test.id = file.service_id')
        .leftJoin(
          DiagnosticQuestion,
          'question',
          profileId
            ? 'test.id = question.test_id AND question.age = :age'
            : 'test.id = question.test_id', // profileId가 있으면 age 조건 추가
          profileId ? { age: age } : {}, // profileId가 있으면 age 값을 전달
        )
        .select([
          'test.id AS id',
          'test.name AS name',
          'test.time AS time',
          'test.description AS description',
          'COUNT(DISTINCT question.id) AS totalQuestions',
          'MAX(file.id::text) AS src',
          'MAX(file.file_name) AS file_name',
          'MAX(file.ext) AS ext',
        ])
        .groupBy('test.id')
        .orderBy('test.created_at', 'ASC');

      /// 프로필 아이디가 있는 경우, 해당 조건 추가
      if (profileId) {
        baseQuery
          .leftJoin(
            DiagnosticResponse,
            'response',
            `question.id = response.question_id AND response.profile_id = :profile_id AND response.archived = :archived`,
            { profile_id: profileId, archived: false },
          )
          .addSelect([
            'COUNT(DISTINCT response.id) AS totalResponses',
            `CASE 
            WHEN COUNT(DISTINCT question.id) > 0 
            THEN (COUNT(DISTINCT response.id) * 100) / COUNT(DISTINCT question.id) 
            ELSE 0 
          END AS status`,
          ]);
      }

      const result = await baseQuery.getRawMany();
      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async question(testId: string, profileId: string, age: string) {
    try {
      const result = await this.diagnosticQuestionRepository
        .createQueryBuilder('question')
        .leftJoin('question.answer', 'answer')
        .leftJoin(
          DiagnosticResponse,
          'response',
          'question.id = response.question_id AND response.profile_id = :profile_id AND response.archived = :archived',
          { profile_id: profileId, archived: false },
        )
        .select('question.id', 'id')
        .addSelect('question.question_text', 'question_text')
        .addSelect(
          "string_agg(CASE WHEN answer.answer_text = '예' THEN '예' WHEN answer.answer_text = '아니오' THEN '아니오' ELSE answer.answer_text END, ',' ORDER BY CASE WHEN answer.answer_text = '예' THEN 1 WHEN answer.answer_text = '아니오' THEN 2 ELSE 3 END)",
          'answers',
        )
        .addSelect(
          'CASE WHEN COUNT(response.question_id) > 0 THEN 1 ELSE 0 END',
          'has_response',
        )
        .where('question.test_id = :test_id AND question.age = :age', {
          test_id: testId,
          age: age,
        })
        .groupBy('question.id')
        .orderBy('question.created_at', 'ASC')
        .getRawMany();

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async completeTest(responses: any[], userUUID: string, profileId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!responses || responses.length === 0) {
        throw new BadRequestException('응답이 없습니다.');
      }

      const sessionId = responses[0].session_id || uuidv4();
      const testId = responses[0].test_id;

      // 1. 응답 저장 (upsert)
      await this.diagnosticResponseRepository.upsert(
        responses.map((r) => ({
          ...r,
          user_id: userUUID,
          session_id: sessionId,
          profile_id: profileId,
        })),
        ['question_id', 'user_id', 'session_id'],
      );

      // 2. 임시저장 후 다시 테스트할 수 있기 때문에 한 번 더 전체적인 설문 결과 select
      const allResponseData = await this.diagnosticResponseRepository.find({
        where: {
          session_id: sessionId,
        },
      });

      // 3. "예" 응답 개수 확인
      const yesCount = allResponseData.filter(
        (r) => r.response_text === '예',
      ).length;

      // 4. 해당 진단 테스트 결과 조회
      const result = await this.diagnosticResultRepository.findOne({
        where: {
          test_id: testId,
          min_score: LessThanOrEqual(yesCount),
          max_score: MoreThanOrEqual(yesCount),
        },
      });

      if (!result) throw new NotFoundException('결과를 찾을 수 없습니다.');

      // 5. 히스토리 저장
      await this.diagnosticHistoryRepository.insert({
        user_id: userUUID,
        session_id: sessionId,
        score: yesCount,
        result_id: result.id,
        test_id: testId,
      });

      // 6. 상세 결과 정보 조회
      const resultInfo = await this.diagnosticResultRepository
        .createQueryBuilder('result')
        .innerJoin(
          DiagnosticHistory,
          'history',
          'result.id = history.result_id AND history.archived = false',
        )
        .innerJoin(DiagnosticTest, 'test', 'result.test_id = test.id')
        .select('result.*')
        .addSelect('history.score', 'score')
        .addSelect('test.name', 'name')
        .where('result.id = :id', { id: result.id })
        .getRawOne();

      await queryRunner.commitTransaction();

      return responseObj.success({
        session_id: sessionId,
        result,
        result_info: resultInfo,
      });
    } catch (e: any) {
      console.error('Error save user block unit time:', e);
      return responseObj.fail(e.message);
    } finally {
      await queryRunner.release();
    }
  }

  async saveResponse(responses: any[], userUUID: string, profileId: string) {
    try {
      const hasNoSession = responses.some((r) => !r.session_id);
      // 세션 ID가 없으면 새로운 세션 ID를 생성
      const newSessionId = hasNoSession ? uuidv4() : null;

      const preparedData = responses.map((item) => {
        return {
          question_id: item.question_id,
          response_text: item.response_text,
          test_id: item.test_id,
          session_id: item.session_id || newSessionId,
          user_id: userUUID,
          profile_id: profileId,
        };
      });

      // ✅ TypeORM upsert 사용
      await this.diagnosticResponseRepository.upsert(preparedData, [
        'question_id',
        'user_id',
        'session_id',
      ]);

      return responseObj.success({
        message: '임시 저장 완료',
        session_id: newSessionId ?? responses[0]?.session_id,
        saved: preparedData.map((item) => ({
          question_id: item.question_id,
          session_id: item.session_id,
        })),
      });
    } catch (e: any) {
      console.log('!! ERROR: ', e);
      return responseObj.fail(e.message);
    }
  }

  async faq() {
    try {
      const result = await this.faqRepository
        .createQueryBuilder('faq')
        .innerJoin(Doctor, 'doctor', 'faq.answered_by = doctor.id')
        .leftJoin(File, 'file', 'doctor.id = file.service_id')
        .select('faq.title', 'title')
        .addSelect('faq.content', 'content')
        .addSelect('doctor.specialty', 'specialty')
        .addSelect('file.id', 'src')
        .addSelect('file.ext', 'ext')
        .where('faq.category = :category', { category: 'doctor' })
        .orderBy('faq.created_at', 'ASC')
        .getRawMany();

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async doctor() {
    try {
      const result = await this.doctorRepository
        .createQueryBuilder('doctor')
        .leftJoin(File, 'file', 'doctor.id = file.service_id')
        .select('doctor.name', 'name')
        .addSelect('doctor.specialty', 'specialty')
        .addSelect('doctor.position', 'position')
        .addSelect('doctor.start_time', 'start_time')
        .addSelect('doctor.end_time', 'end_time')
        .addSelect('file.id', 'src')
        .addSelect('file.ext', 'ext')
        .orderBy('doctor.created_at', 'ASC')
        .getRawMany();

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async getRecentSession(testId: string, profileId: string, userUUID: string) {
    const lastResponse = await this.diagnosticResponseRepository.findOne({
      where: {
        test_id: testId,
        profile_id: profileId,
        user_id: userUUID,
        archived: false,
      },
      order: { created_at: 'DESC' },
    });

    // 세션이 있으면 진단 테스트 시작했다는 뜻
    if (lastResponse) {
      // 세션 아이디로 진단 히스토리 조회
      const result = await this.diagnosticHistoryRepository.findOne({
        where: { session_id: lastResponse.session_id },
        order: { created_at: 'DESC' },
      });

      // 진단 히스토리가 있으면 테스트가 끝났다는 뜻 진단 결과 조회
      if (result?.result_id) {
        // ✅  진단 결과 조회
        const resultInfo = await this.diagnosticResultRepository
          .createQueryBuilder('result')
          .innerJoin(
            DiagnosticHistory,
            'history',
            'result.id = history.result_id AND history.archived = :archived',
            { archived: false },
          )
          .innerJoin(DiagnosticTest, 'test', 'result.test_id = test.id')
          .select('result.*')
          .addSelect('history.score', 'score')
          .addSelect('history.session_id', 'session_id')
          .addSelect('test.name', 'name')
          .where('result.id = :id', { id: result.result_id })
          .getRawOne();
        // const resultInfo = await this.diagnosticResultRepository.findOne({
        //   where: { id: result.result_id },
        // });

        return responseObj.success({
          session_id: lastResponse.session_id,
          is_clear: true,
          result_info: resultInfo,
        });
      } else {
        // 진단 히스토리가 없으면 테스트가 끝나지 않았다는 뜻
        return responseObj.success({
          session_id: lastResponse.session_id,
          is_clear: false,
        });
      }
    } else {
      // 세션이 없으면 세션 아이디를 null로 반환
      return responseObj.success({ session_id: null, is_clear: false });
    }
  }

  async deleteSessionAndAnswers(sessionId: string) {
    try {
      if (!sessionId) {
        return responseObj.fail('세션 ID가 필요합니다.');
      }

      const session = await this.diagnosticResponseRepository.findOne({
        where: { session_id: sessionId },
      });

      if (!session) {
        return responseObj.fail('연결된 세션이 없습니다.');
      }

      await this.diagnosticResponseRepository.delete({
        session_id: session.session_id,
        test_id: session.test_id,
        user_id: session.user_id,
      });
      return responseObj.success({ message: '세션 삭제 완료' });
    } catch (error) {
      console.error('세션 삭제 중 오류 발생:', error);
      return responseObj.fail('세션 삭제 중 오류가 발생했습니다.');
    }
  }

  async restartSession(testId: string, sessionId: string, profileId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 기존 응답 기록 archive 처리
      await this.diagnosticResponseRepository.update(
        // { test_id: testId, session_id: sessionId, profile_id: profileId },
        // 해당 테스트에 대한 이전의 임시저장 값은 테스트를 다시하게 되면 의미가 없기 때문에 현재 선택한 테스트에 해당하는 모든 값은 archived => true로 변경
        { test_id: testId, profile_id: profileId },
        { archived: true },
      );

      await this.diagnosticHistoryRepository.update(
        { session_id: sessionId },
        { archived: true },
      );

      await queryRunner.commitTransaction();

      return responseObj.success({ message: '세션 재시작 완료' });
    } catch (e: any) {
      console.log('!! RESTART ERROR: ', e);
      return responseObj.fail(e.message);
    } finally {
      await queryRunner.release();
    }
  }
}
