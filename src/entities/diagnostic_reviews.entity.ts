import { CreateDateColumn, OneToMany } from 'typeorm';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DiagnosticTest } from './diagnostic_tests.entity';
import { Users } from './users.entity';
import { DiagnosticReviewComment } from './diagnostic_review_comments.entity';
import { DiagnosticReviewLike } from './diagnostic_review_likes.entity';

// 진단 테스트 리뷰(후기)
@Entity('diagnostic_reviews')
export class DiagnosticReview {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DiagnosticTest, (test) => test.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'test_id' })
  test: DiagnosticTest;

  @Column()
  test_id: number;

  @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column()
  user_id: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => DiagnosticReviewComment, (comment) => comment.review)
  comments: DiagnosticReviewComment[];

  @OneToMany(() => DiagnosticReviewLike, (like) => like.review)
  likes: DiagnosticReviewLike[];
}
