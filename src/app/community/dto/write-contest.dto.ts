import { ApiProperty } from '@nestjs/swagger';

export class WriteContestDto {
  @ApiProperty({ description: '제목' })
  title: string;

  @ApiProperty({ description: '내용' })
  content: string;

  @ApiProperty({ description: '이미지' })
  images: any[];
}
