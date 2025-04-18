import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChildrenProfile } from './children_profile.entity';
import { BaseEntity } from './base.entity';
import { MathUnits } from './math_units.entity';

@Entity({ name: 'math_progress', comment: '영어 진행 상태 테이블' })
export class MathProgress extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChildrenProfile, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'child_profile_id' })
  child_profile: ChildrenProfile;

  @ManyToOne(() => MathUnits, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'unit_id' })
  unit: MathUnits;

  @Column({ type: 'boolean', default: false, comment: '클리어 여부' })
  is_cleared: boolean;
}
