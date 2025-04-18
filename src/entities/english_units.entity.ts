import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EnglishLevels } from './english_levels.entity';
import { EnglishUnitDetails } from './english_unit_details.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'english_units', comment: '영어 단계(Unit) 테이블' })
export class EnglishUnits extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EnglishLevels, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'level_id' })
  level: EnglishLevels;

  @Column({ type: 'int', comment: '단계 번호' })
  unit_number: number;

  @Column({ length: 100, comment: '유닛 타이틀', nullable: true })
  unit_title: string;

  @Column({
    type: 'integer',
    comment: '학습 포인트',
    default: 0,
  })
  unit_point: number;

  @OneToMany(() => EnglishUnitDetails, (unitDetail) => unitDetail.units, {
    cascade: true,
  })
  unitDetails: EnglishUnitDetails[];

  @Column({
    length: 100,
    comment: 'unit 썸네일',
    nullable: true,
  })
  unit_main_img: string;
}
