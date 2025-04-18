import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', comment: '생성 날짜' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '업데이트 날짜' })
  updated_at: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    comment: '삭제 날짜',
    nullable: true,
  })
  deleted_at: Date;
}
