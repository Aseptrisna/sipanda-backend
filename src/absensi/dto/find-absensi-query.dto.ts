import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  StatusVerifikasiWajah,
  SumberAbsensi,
  TipeAbsen,
} from '../../common/enums';

export class FindAbsensiQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  kelas_id?: string;

  @IsOptional()
  @IsMongoId()
  siswa_id?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  tanggal?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  tanggal_mulai?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  tanggal_selesai?: string;

  @IsOptional()
  @IsEnum(TipeAbsen)
  tipe_absen?: TipeAbsen;

  @IsOptional()
  @IsEnum(SumberAbsensi)
  sumber?: SumberAbsensi;

  @IsOptional()
  @IsEnum(StatusVerifikasiWajah)
  status_verifikasi?: StatusVerifikasiWajah;
}
