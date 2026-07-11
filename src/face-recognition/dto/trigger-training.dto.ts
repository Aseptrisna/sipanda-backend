import { ArrayMinSize, IsArray, IsMongoId } from 'class-validator';

export class TriggerTrainingDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  siswa_ids: string[];
}
