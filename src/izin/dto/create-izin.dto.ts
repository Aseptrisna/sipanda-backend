import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { StatusAbsensi } from '../../common/enums';

export class CreateIzinDto {
  @IsMongoId()
  siswa_id: string;

  @IsIn([StatusAbsensi.SAKIT, StatusAbsensi.IZIN])
  jenis: StatusAbsensi.SAKIT | StatusAbsensi.IZIN;

  @IsDateString(
    { strict: true },
    { message: 'tanggal_mulai harus berformat YYYY-MM-DD' },
  )
  tanggal_mulai: string;

  @IsDateString(
    { strict: true },
    { message: 'tanggal_selesai harus berformat YYYY-MM-DD' },
  )
  tanggal_selesai: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  lampiran_url?: string;
}
