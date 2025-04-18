import { IsString, IsInt, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseVerificationDto {
  @ApiProperty({ description: 'submit | later' })
  @IsString()
  @IsOptional()
  type: string;

  @ApiProperty({ description: 'Location of the purchase' })
  @IsString()
  @IsOptional()
  purchase_location: string;

  @ApiProperty({ description: 'Name of the order' })
  @IsString()
  @IsOptional()
  order_name: string;

  @ApiProperty({ description: 'Age of the purchaser' })
  @IsInt()
  @IsOptional()
  age: number;

  @ApiProperty({
    description: 'Phone number of the purchaser',
    example: '01012345678',
  })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({
    description: 'Gender of the purchaser',
    enum: ['male', 'female'],
  })
  @IsIn(['male', 'female'])
  @IsOptional()
  gender: 'male' | 'female';

  @ApiProperty({ description: 'Order number' })
  @IsString()
  @IsOptional()
  order_number: string;
}
