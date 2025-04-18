import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChildrenProfile } from './children_profile.entity';
import { DiagnosticTest } from './diagnostic_tests.entity';
import { BaseEntity } from './base.entity';
import { Users } from './users.entity';

// 프로필별 자녀 진단 테스트 상태
@Entity('children_test_status')
export class ChildrenTestStatus extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChildrenProfile, { onDelete: 'NO ACTION' })
  @JoinColumn()
  child: ChildrenProfile;

  @ManyToOne(() => Users, { onDelete: 'NO ACTION' })
  @JoinColumn()
  user: Users;

  @ManyToOne(() => DiagnosticTest, { onDelete: 'NO ACTION' })
  @JoinColumn()
  test: DiagnosticTest;

  @Column({
    type: 'enum',
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  })
  status: 'not_started' | 'in_progress' | 'completed';

  @Column({ type: 'int', nullable: true, comment: '진행 퍼센트' })
  progress: number;
}
