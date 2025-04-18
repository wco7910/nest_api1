import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { MathUnits } from './math_units.entity';
import { MathUnitFiles } from './math_unit_files.entity';

@Entity({ name: 'math_unit_details', comment: '수학 단계(Unit) 상세 테이블' })
export class MathUnitDetails extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MathUnits, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'unit_id' })
  units: MathUnits;

  @Column({
    length: 50,
    comment: '배우기(learn), 익히기(get), 쓰기(write) 구분 값',
  })
  unit_tab_name: string;

  @Column({ type: 'bigint', comment: '숫자', nullable: true })
  unit_number: number;

  @Column({ length: 50, comment: '숫자 발음', nullable: true })
  unit_speak: string;

  @Column({ length: 100, comment: 'unit에 나오는 문제', nullable: true })
  unit_problem: string;

  @Column({
    length: 50,
    comment: 'unit의 문제(unit_problem)에 들어갈 정답',
    nullable: true,
  })
  unit_correct_word: string;

  @Column({
    length: 100,
    comment: 'unit의 문제(unit_problem)에 들어갈 오답',
    nullable: true,
  })
  unit_incorrect_word: string;

  @Column({
    type: 'json',
    comment: '쓰기 연습을 위한 stroke 데이터',
    nullable: true,
  })
  unit_write_stroke: string;

  @Column({
    type: 'integer',
    comment: '배우기, 익히기, 쓰기의 세부 순서',
    default: 0,
  })
  unit_sort: number;

  @OneToMany(() => MathUnitFiles, (file) => file.unitDetails, {
    cascade: true,
  })
  files: MathUnitFiles[];
}
