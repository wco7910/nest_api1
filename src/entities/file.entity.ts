import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UUID } from 'crypto';

@Entity('file')
export class File extends BaseEntity {
  @Column({ comment: '파일 이름' })
  file_name: string;

  @Column({ comment: 'ext' })
  ext: string;

  @Column({ comment: 'type' })
  type: string;

  @Column({ comment: '서비스 아이디', nullable: true, type: 'uuid' })
  service_id: UUID;

  @Column({ comment: '사용여부', default: 'T' })
  in_used: string;

  @Column({ comment: '파일 크기' })
  size: string;

  @Column({ comment: 'MIME 타입' })
  mime_type: string;
}
