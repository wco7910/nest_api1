import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { MathLevels } from './math_levels.entity';
import { BaseEntity } from './base.entity';
import { MathUnitDetails } from './math_unit_details.entity';

@Entity({ name: 'math_units', comment: '수학 단계(Unit) 테이블' })
export class MathUnits extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MathLevels, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'level_id' })
  level: MathLevels;

  @Column({ type: 'int', comment: '단계 번호' })
  unit_number: number;

  @Column({ length: 100, comment: '유닛 타이틀' })
  unit_title: string;

  @Column({
    type: 'integer',
    comment: '학습 포인트',
    default: 0,
  })
  unit_point: number;

  @Column({
    length: 100,
    comment: 'unit 썸네일',
    nullable: true,
  })
  unit_main_img: string;

  @OneToMany(() => MathUnitDetails, (unitDetail) => unitDetail.units, {
    cascade: true,
  })
  unitDetails: MathUnitDetails[];
}
