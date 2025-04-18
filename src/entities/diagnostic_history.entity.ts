import { CreateDateColumn, Entity } from 'typeorm';

import { Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('diagnostic_history')
export class DiagnosticHistory extends BaseEntity {
  @Column('uuid') user_id: string;
  @Column('uuid') test_id: string;
  @Column('int') score: number;
  @Column('uuid') result_id: string;

  @Column('uuid', { comment: '세션 ID' })
  session_id: string; // ✅ 같은 세션 ID 저장

  @Column({ default: false })
  archived: boolean;

  @CreateDateColumn() created_at: Date;
}
