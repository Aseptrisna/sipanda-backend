import { IsInt, IsMongoId, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RekapBulananQueryDto {
  @IsMongoId()
  kelas_id: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  bulan: number;

  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  tahun: number;
}
