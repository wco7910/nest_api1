import { Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';

// 진단 테스트 유저 답변
@Entity('diagnostic_responses')
@Unique(['question_id', 'user_id', 'session_id']) // ✅ upsert 기준
export class DiagnosticResponse extends BaseEntity {
  @Column('uuid')
  question_id: string;

  @Column('uuid', { comment: '진단 테스트 ID' })
  test_id: string;

  @Column('uuid', { comment: '선택한 자녀 프로필 ID' })
  profile_id: string;

  @Column('uuid')
  user_id: string;

  @Column()
  response_text: string;

  @Column('uuid', { comment: '테스트 세션 ID' })
  session_id: string; // ✅ 추가: 같은 세션 내 응답을 구분

  @Column({ default: false })
  archived: boolean;
}
