import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'profile_image_files', comment: '프로필 이미지 파일 테이블' })
export class ProfileImageFile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: '파일 원본 이름' })
  originalname: string;

  @Column({ comment: '저장된 파일 경로' })
  path: string;

  @Column({ comment: '파일 크기 (byte)' })
  size: number;

  @Column({ comment: 'MIME 타입' })
  mimetype: string;

  @Column({ comment: '파일 타입', default: 'users' })
  fileType: string;
}
