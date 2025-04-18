import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { KoreanUnitDetails } from './korean_unit_details.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'korean_unit_files', comment: '블록 유닛 파일 테이블' })
export class KoreanUnitFiles extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => KoreanUnitDetails, (unitDetail) => unitDetail.files, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'unit_details_id' })
  unitDetails: KoreanUnitDetails;

  @Column({ comment: '파일 경로' })
  path: string;

  @Column({
    comment: '파일 타입 (image, 3d)',
    nullable: true,
  })
  type: string;

  @Column({ type: 'int', comment: '파일 정렬', nullable: true, default: 0 })
  sort: number;

  @Column({ comment: '파일 원본 이름', nullable: true })
  originalname: string;

  @Column({ comment: 'MIME 타입', nullable: true })
  mimetype: string;

  @Column({ comment: '파일 크기 (byte)', nullable: true, type: 'int' })
  size: number;
}
