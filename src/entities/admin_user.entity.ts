import * as bcrypt from 'bcryptjs';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @PrimaryColumn()
  @Column({ comment: '유저 아이디', unique: true })
  admin_id: string;

  @Column({ comment: '유저 비밀번호' })
  password: string;

  @Column({ comment: '관리자 여부', default: 'USER' })
  user_type: string;

  @Column({ comment: '가입상태', default: 'PENDING' })
  state: string;

  @Column({ comment: '유저 이름' })
  name: string;

  @Column({ comment: '휴대폰번호' })
  phone: string;

  @Column({ comment: '이메일' })
  email: string;

  @BeforeInsert()
  async setPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updated_at!: Date;
}
