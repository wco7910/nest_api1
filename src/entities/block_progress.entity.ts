import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChildrenProfile } from './children_profile.entity';
import { BlockUnits } from './block_units.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'block_progress', comment: '블록 진행 상태 테이블' })
export class BlockProgress extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChildrenProfile, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'child_profile_id' })
  child_profile: ChildrenProfile;

  @ManyToOne(() => BlockUnits, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'unit_id' })
  unit: BlockUnits;

  @Column({ type: 'boolean', default: false, comment: '클리어 여부' })
  is_cleared: boolean;

  @Column({ type: 'int', nullable: true, comment: '소요 시간 (초)' })
  elapsed_time: number;
}
