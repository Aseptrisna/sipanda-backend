import { IsBoolean, IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { StatusAbsensi } from '../../common/enums';

export class VerifikasiWajahDto {
  @IsOptional()
  @IsBoolean()
  tolak?: boolean;

  @ValidateIf((dto: VerifikasiWajahDto) => !dto.tolak)
  @IsEnum(StatusAbsensi)
  status?: StatusAbsensi;
}
