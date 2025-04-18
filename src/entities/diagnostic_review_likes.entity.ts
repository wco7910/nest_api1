import { CreateDateColumn } from 'typeorm';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DiagnosticReview } from './diagnostic_reviews.entity';
import { Users } from './users.entity';

// 진단 테스트 리뷰(후기) 좋아요
@Entity('diagnostic_review_likes')
export class DiagnosticReviewLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DiagnosticReview, (review) => review.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reviewId' })
  review: DiagnosticReview;

  @Column()
  review_id: number;

  @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column()
  user_id: number;

  @CreateDateColumn()
  liked_at: Date;
}
