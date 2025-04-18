import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto<T = undefined> {
  @ApiProperty({ type: Boolean, description: '성공여부' })
  readonly success: boolean;

  @ApiProperty({ type: String, description: '실패시 메세지', required: false })
  readonly message?: string;

  @ApiProperty({
    type: 'generic',
    required: false,
  })
  data?: T;
}

export class FailResponseDto {
  @ApiProperty({ description: '성공 여부', default: false })
  success: boolean;

  @ApiProperty({ description: '실패 메시지', example: 'fail' })
  message: string;
}
