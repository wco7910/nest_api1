import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { KoreanLevels } from './korean_levels.entity';
import { KoreanUnitDetails } from './korean_unit_details.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'korean_units', comment: '한글 단계(Unit) 테이블' })
export class KoreanUnits extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => KoreanLevels, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'level_id' })
  level: KoreanLevels;

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

  @OneToMany(() => KoreanUnitDetails, (unitDetail) => unitDetail.units, {
    cascade: true,
  })
  unitDetails: KoreanUnitDetails[];

  @Column({
    length: 100,
    comment: 'unit 썸네일',
    nullable: true,
  })
  unit_main_img: string;
}
