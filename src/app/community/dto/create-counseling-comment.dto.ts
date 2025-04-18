import { IsUUID, IsString } from 'class-validator';

export class CreateCounselingCommentDto {
  @IsString()
  content: string;

  @IsUUID()
  doctor_id: string;

  @IsUUID()
  counseling_id: string;
}
