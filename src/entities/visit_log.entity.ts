import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Users } from './users.entity';
import { ChildrenProfile } from './children_profile.entity';

@Entity('visit_log')
export class VisitLog extends BaseEntity {
  @ManyToOne(() => ChildrenProfile, { onDelete: 'NO ACTION' })
  @JoinColumn()
  child: ChildrenProfile;

  @ManyToOne(() => Users, { onDelete: 'NO ACTION' })
  @JoinColumn()
  user: Users;
}
