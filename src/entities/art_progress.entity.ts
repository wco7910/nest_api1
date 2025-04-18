import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChildrenProfile } from './children_profile.entity';
import { ArtUnits } from './art_units.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'art_progress', comment: '미술 진행 상태 테이블' })
export class ArtProgress extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChildrenProfile, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'child_profile_id' })
  child_profile: ChildrenProfile;

  @ManyToOne(() => ArtUnits, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'unit_id' })
  unit: ArtUnits;

  @Column({ type: 'boolean', default: false, comment: '클리어 여부' })
  is_cleared: boolean;

  @Column({
    length: 100,
    default: false,
    comment: '현재까지 색칠한 사진 파일 경로',
  })
  user_file_path: string;
}
