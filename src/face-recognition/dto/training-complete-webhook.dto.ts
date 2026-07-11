import { IsIn, IsInt, IsMongoId, IsOptional, IsString } from 'class-validator';

export class TrainingCompleteWebhookDto {
  @IsMongoId()
  student_id: string;

  @IsIn(['trained', 'failed'])
  status: 'trained' | 'failed';

  @IsInt()
  version: number;

  @IsOptional()
  @IsString()
  model_version?: string;

  @IsOptional()
  @IsString()
  error_message?: string;
}
