import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './users.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class PurchaseVerification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, comment: '구매처' })
  purchase_location: string;

  @Column({ length: 100, comment: '주문자명' })
  order_name: string;

  @Column({ type: 'int', comment: '나이', nullable: true })
  age: number;

  @Column({ length: 50, comment: '연락처', nullable: true })
  phone: string;

  @Column({ type: 'varchar', comment: '생년월일', nullable: true })
  birth_date: string;

  @Column({
    type: 'enum',
    enum: ['male', 'female'],
    comment: '성별 (male, female)',
    nullable: true,
  })
  gender: string;

  @Column({ length: 100, comment: '주문번호', unique: true })
  order_number: string;

  @OneToOne(() => Users, (user) => user.id, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn() // FK로 연결
  user: Users;
}
