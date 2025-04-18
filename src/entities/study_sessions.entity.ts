import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { ChildrenProfile } from './children_profile.entity';
import { UserPointHistory } from './user_point_histories.entity';
import { BaseEntity } from './base.entity';

// 'child' (ManyToOne 관계에서 생성되는 외래키: child_id)와 start_time 컬럼에 대해 복합 인덱스 생성
@Index('idx_study_sessions_child_time', ['child', 'start_time'])
@Entity({ name: 'study_sessions', comment: '학습 세션 기록 테이블' })
export class StudySessions extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChildrenProfile, (child) => child.id, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'child_id' }) // 외래키 컬럼 이름을 child_id로 명시
  child: ChildrenProfile;

  @ManyToOne(() => UserPointHistory, { nullable: true, onDelete: 'NO ACTION' })
  pointHistory: UserPointHistory;

  @Column({ length: 10, comment: '학습 카테고리 (한글, 영어, 수학 등)' })
  category: string;

  @Column({ comment: '학습 Unit ID' })
  unit_id: string;

  @CreateDateColumn({ comment: '학습 시작 시간' })
  start_time: Date;

  @UpdateDateColumn({ comment: '학습 종료 시간' })
  end_time: Date;

  @Column({
    type: 'int',
    default: 0,
    comment: '학습 중 획득한 포인트',
  })
  earned_points: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '학습 총 소요 시간 (초)',
  })
  duration: number;
}
