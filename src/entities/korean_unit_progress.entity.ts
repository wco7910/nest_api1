import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChildrenProfile } from './children_profile.entity';
import { BaseEntity } from './base.entity';
import { KoreanUnits } from './korean_units.entity';

@Entity({ name: 'korean_progress', comment: '한글 진행 상태 테이블' })
export class KoreanProgress extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChildrenProfile, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'child_profile_id' })
  child_profile: ChildrenProfile;

  @ManyToOne(() => KoreanUnits, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'unit_id' })
  unit: KoreanUnits;

  @Column({ type: 'boolean', default: false, comment: '클리어 여부' })
  is_cleared: boolean;
}
