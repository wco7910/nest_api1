import { Column, OneToMany } from 'typeorm';
import { Entity } from 'typeorm';
import { DiagnosticQuestion } from './diagnostic_questions.entity';
import { DiagnosticReview } from './diagnostic_reviews.entity';
import { ChildrenTestStatus } from './children_test_status.entity';

import { BaseEntity } from './base.entity';

/**
 * DiagnosticTest: 진단 테스트 정보 저장 (썸네일 이미지, 이름, 소개 글 등)
    Review: 진단 테스트에 대한 후기
    ReviewComment: 후기 댓글
    ReviewLike: 후기 좋아요
    DiagnosticQuestion: 진단 테스트에 속한 질문
    DiagnosticAnswer: 질문에 대한 사용자 응답
    DiagnosticResult: 진단 결과와 히스토리 관리
    DiagnosticResponse: 진단 테스트 유저 답변
 */
// 진단 테스트 메인 정보
@Entity('diagnostic_tests')
export class DiagnosticTest extends BaseEntity {
  @Column()
  name: string;

  @Column()
  time: number;

  @Column('text')
  description: string;

  @OneToMany(() => DiagnosticQuestion, (question) => question.test)
  question: DiagnosticQuestion[];

  @OneToMany(() => DiagnosticReview, (review) => review.test)
  reviews: DiagnosticReview[];

  @OneToMany(() => ChildrenTestStatus, (status) => status.test, {
    cascade: true,
  })
  testStatus: ChildrenTestStatus[];
}
