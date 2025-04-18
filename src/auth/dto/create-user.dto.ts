import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '유효한 이메일 주소' })
  email: string;

  @ApiProperty({ description: '유저 ID', minLength: 3, maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: '유저 ID는 필수 항목입니다.' })
  @Length(3, 100, {
    message: '유저 ID는 최소 3자 이상, 최대 100자 이하이어야 합니다.',
  })
  user_id: string;

  @ApiProperty({ description: '비밀번호', minLength: 3, maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다.' })
  @Length(3, 100, { message: '비밀번호는 최소 3자 이상이어야 합니다.' })
  password: string;

  @ApiProperty({ description: '유저 이름' })
  @IsString()
  @IsNotEmpty({ message: '유저 이름은 필수 항목입니다.' })
  username: string;

  @ApiPropertyOptional({ description: '우편번호' })
  @IsString()
  @IsOptional()
  zip_code?: string;

  @ApiPropertyOptional({ description: '주소' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: '상세 주소' })
  @IsString()
  @IsOptional()
  address_detail?: string;

  @ApiPropertyOptional({
    description: '성별',
    enum: ['male', 'female', 'other'],
  })
  @IsEnum(['male', 'female', 'other'], {
    message: '성별은 male, female 중 하나여야 합니다.',
  })
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    description: '생년월일',
    type: String,
  })
  birthdate?: string;

  @ApiPropertyOptional({ description: '제공자' })
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: '제공자 ID' })
  @IsString()
  @IsOptional()
  provider_id?: string;
}
