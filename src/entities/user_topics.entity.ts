import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './users.entity';
import { Topic } from './topics.entity';
import { BaseEntity } from './base.entity';

/** 사용자와 관심 주제 간의 다대다 관계를 관리합니다. */
@Entity()
export class UserTopic extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;

  @ManyToOne(() => Topic, (topic) => topic.id, { onDelete: 'CASCADE' })
  @JoinColumn()
  topic: Topic;
}
