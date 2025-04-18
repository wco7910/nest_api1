import { ApiProperty } from '@nestjs/swagger';
export class WriteCounselDto {
  @ApiProperty({ description: '제목' })
  title: string;
  @ApiProperty({ description: '내용' })
  content: string;
  @ApiProperty({ description: '주제' })
  topic_id: string;
  @ApiProperty({ description: '비밀글 여부' })
  is_secret: boolean;
}
