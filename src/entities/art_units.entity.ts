import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ArtUnitFiles } from './art_unit_files.entity';
import { ArtLevels } from './art_levels.entity';
import { ArtProgress } from './art_progress.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'art_units', comment: '미술 단계(Unit) 테이블' })
export class ArtUnits extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ArtLevels, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'level_id' })
  level: ArtLevels;

  @Column({ type: 'int', comment: '단계 번호' })
  unit_number: number;

  @Column({ length: 100, comment: '유닛 타이틀' })
  unit_title: string;

  @Column({
    type: 'int',
    comment: '유닛 타입(타입에 따라 컨텐츠 템플릿(UI)가 다름',
    default: 0,
  })
  unit_type: number;

  @OneToMany(() => ArtUnitFiles, (file) => file.unit, { cascade: true })
  files: ArtUnitFiles[];

  @OneToMany(() => ArtProgress, (progress) => progress.unit, {
    cascade: true,
  })
  progresses: ArtProgress[];
}
