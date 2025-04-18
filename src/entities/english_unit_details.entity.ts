import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { EnglishUnits } from './english_units.entity';
import { EnglishUnitFiles } from './english_unit_files.entity';

@Entity({
  name: 'english_unit_details',
  comment: '영어 단계(Unit) 상세 테이블',
})
export class EnglishUnitDetails extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EnglishUnits, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'unit_id' })
  units: EnglishUnits;

  @Column({
    length: 50,
    comment: '배우기(learn), 익히기(get), 쓰기(write) 구분 값',
  })
  unit_tab_name: string;

  @Column({ length: 50, comment: '알파벳', nullable: true })
  unit_vowel: string;

  @Column({ length: 50, comment: '영어 발음', nullable: true })
  unit_speak: string;

  @Column({ length: 50, comment: '한국어 발음', nullable: true })
  unit_korean: string;

  @Column({
    length: 50,
    comment: '각 unit에 필요한 단어들 ex) 사과, 바다, 아빠 등',
    nullable: true,
  })
  unit_word: string;

  @Column({ type: 'text', comment: '각 unit에 필요한 문장', nullable: true })
  unit_sentence: string;

  @Column({ length: 100, comment: 'unit에 나오는 문장 문제', nullable: true })
  unit_problem: string;

  @Column({
    length: 50,
    comment: 'unit의 문제 문장(unit_problem)에 들어갈 정답 단어',
    nullable: true,
  })
  unit_correct_word: string;

  @Column({
    length: 100,
    comment: 'unit의 문제 문장(unit_problem)에 들어갈 오답 단어',
    nullable: true,
  })
  unit_incorrect_word: string;

  @Column({
    type: 'text',
    comment: 'unit의 책 줄거리',
    nullable: true,
  })
  unit_book_story: string;

  @Column({
    type: 'integer',
    comment: '배우기, 익히기, 쓰기의 세부 순서',
    default: 0,
  })
  unit_sort: number;

  @Column({
    type: 'json',
    comment: '쓰기 연습을 위한 stroke 데이터',
    nullable: true,
  })
  unit_write_stroke: string;

  @OneToMany(() => EnglishUnitFiles, (file) => file.unitDetails, {
    cascade: true,
  })
  files: EnglishUnitFiles[];
}
