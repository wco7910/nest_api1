import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ description: '아이디' })
  user_id: string;

  @ApiProperty({ description: '비밀번호' })
  password: string;
}
