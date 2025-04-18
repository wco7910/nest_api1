import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { DiagnosticTest } from './diagnostic_tests.entity';
import { DiagnosticAnswer } from './diagnostic_answers.entity';

//진단 테스트에 속한 질문항목들
@Entity('diagnostic_questions')
export class DiagnosticQuestion extends BaseEntity{
  @Column('uuid')
  test_id: string;

  @Column()
  question_text: string;
  
  @Column()
  age: string;

  @ManyToOne(() => DiagnosticTest, (test) => test.question, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'test_id' })
  test: DiagnosticTest

  @OneToMany(() => DiagnosticAnswer, (answer) => answer.question)
  answer: DiagnosticAnswer[];

  // @Column({ type: 'enum', enum: ['multiple_choice', 'short_answer'] })
  // type: 'multiple_choice' | 'short_answer';

  // @Column('simple-json', { nullable: true })
  // options: string[]; // 선택형일 경우 보기 옵션
}
