import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { DiagnosticQuestion } from './diagnostic_questions.entity';
// import { Users } from './users.entity';

// 진단 테스트 답변
@Entity('diagnostic_answers')
export class DiagnosticAnswer extends BaseEntity {

  @Column('uuid')
  question_id: string;

  @Column()
  answer_text: string;

  // @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'user_id' })
  // user: Users;

  @ManyToOne(() => DiagnosticQuestion, (question) => question.answer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: DiagnosticQuestion;
}
