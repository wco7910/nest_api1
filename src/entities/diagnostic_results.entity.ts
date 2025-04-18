import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { DiagnosticTest } from './diagnostic_tests.entity';

/**
 * 진단 테스트 결과 Document 테이블
 */
@Entity('diagnostic_results')
export class DiagnosticResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DiagnosticTest, (test) => test.id)
  @JoinColumn({ name: 'test_id' })
  test: DiagnosticTest;

  @Column()
  test_id: number;

  @Column({ type: 'int', comment: '점수' })
  min_score: number;

  @Column({ type: 'int', comment: '최대 점수' })
  max_score: number;

  @Column({ comment: '범위 정보' })
  rangeInfo: string;

  @Column({ comment: '테스트 코멘트' })
  testComment: string;

  @Column({ comment: '나이' })
  age: string;

  @Column('text', { comment: '결과 설명' })
  result_description: string;

  @CreateDateColumn()
  created_at: Date;
}
