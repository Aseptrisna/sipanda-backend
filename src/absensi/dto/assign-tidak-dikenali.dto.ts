import { IsMongoId } from 'class-validator';

export class AssignTidakDikenaliDto {
  @IsMongoId()
  siswa_id: string;
}
