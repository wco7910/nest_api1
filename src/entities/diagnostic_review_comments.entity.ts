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

// 진단 테스트 리뷰(후기) 댓글
@Entity('diagnostic_review_comments')
export class DiagnosticReviewComment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DiagnosticReview, (review) => review.comments, {
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

  @Column('text')
  content: string;

  @CreateDateColumn()
  created_at: Date;
}
