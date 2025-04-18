import { IsNotEmpty } from 'class-validator';

export class AddQuestionDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;
}
