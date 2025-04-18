import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class Log extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', comment: '수정 타입', nullable: true })
  status?: string;

  @Column({ type: 'varchar', comment: '작업내용', nullable: true })
  description?: string;

  @Column({ type: 'varchar', comment: '변경 컬럼', nullable: true })
  changeId?: string;

  @Column({ type: 'varchar', comment: '작업자', nullable: true })
  updateId?: string;
}
