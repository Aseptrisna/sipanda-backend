import { IsIn, IsOptional, IsString } from 'class-validator';
import { StatusIzin } from '../../common/enums';

export class ProsesIzinDto {
  @IsIn([StatusIzin.DISETUJUI, StatusIzin.DITOLAK])
  status: StatusIzin.DISETUJUI | StatusIzin.DITOLAK;

  @IsOptional()
  @IsString()
  catatan?: string;
}
