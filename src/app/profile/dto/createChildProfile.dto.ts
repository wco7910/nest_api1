import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ProfileFileInfo {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '이미지 파일명' })
  originalname: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '이미지 파일 타입' })
  mimetype: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: '파일 크기' })
  size: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '이미지 URL' })
  path: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '업데이트 날짜' })
  updatedAt: string;
}

export class CreateChildProfileDto {
  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '생일' })
  birth_date: string;

  @IsIn(['male', 'female'])
  @ApiProperty({ description: 'male | female' })
  gender: 'male' | 'female';

  @ApiProperty({
    description:
      '프로필 아이콘 선택시 아이콘 이미지 파일 테이블 id 값(프로필 이미지 업로드 대체)',
  })
  icon: string;

  @ApiProperty({ description: '자녀 프로필 텍스트' })
  profile_text: string;

  @Type(() => ProfileFileInfo)
  @ApiProperty({
    description: '프로필 파일 정보',
    type: () => ProfileFileInfo,
    required: false,
  })
  profile_file_info?: ProfileFileInfo;
}
