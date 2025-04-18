import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BlockUnitFiles } from './block_unit_files.entity';
import { BlockLevels } from './block_levels.entity';
import { BlockProgress } from './block_progress.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'block_units', comment: '블록 단계(Unit) 테이블' })
export class BlockUnits extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BlockLevels, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'level_id' })
  level: BlockLevels;

  @Column({ type: 'int', comment: '단계 번호' })
  unit_number: number;

  @Column({ length: 100, comment: '유닛 타이틀' })
  unit_title: string;

  @Column({ comment: '유닛 클리어시 획득 포인트', default: 1 })
  unit_point: number;

  @Column({
    type: 'int',
    comment: '유닛 타입(타입에 따라 컨텐츠 템플릿(UI)가 다름',
    default: 0,
  })
  unit_type: number;

  @Column({ length: 100, comment: '유닛 주제', nullable: true })
  unit_subject: string;

  @OneToMany(() => BlockUnitFiles, (file) => file.unit, { cascade: true })
  files: BlockUnitFiles[];

  @OneToMany(() => BlockProgress, (progress) => progress.unit, {
    cascade: true,
  })
  progresses: BlockProgress[];
}
