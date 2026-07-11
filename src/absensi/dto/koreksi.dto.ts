import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusAbsensi } from '../../common/enums';

export class KoreksiDto {
  @IsEnum(StatusAbsensi)
  status: StatusAbsensi;

  @IsOptional()
  @IsString()
  keterangan?: string;
}
