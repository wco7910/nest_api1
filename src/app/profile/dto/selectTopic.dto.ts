import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectTopicDto {
  @IsArray()
  @ApiProperty({ type: [String], description: 'Array of topic IDs' })
  topicIds: Array<string>;
}
