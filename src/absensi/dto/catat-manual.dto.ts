import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { StatusAbsensi, TipeAbsen } from '../../common/enums';

export class AbsensiEntryDto {
  @IsMongoId()
  siswa_id: string;

  @IsEnum(StatusAbsensi)
  status: StatusAbsensi;

  @IsOptional()
  @IsString()
  keterangan?: string;
}

export class CatatManualDto {
  @IsMongoId()
  kelas_id: string;

  @IsDateString(
    { strict: true },
    { message: 'tanggal harus berformat YYYY-MM-DD' },
  )
  tanggal: string;

  @IsEnum(TipeAbsen)
  tipe_absen: TipeAbsen;

  @ValidateIf((dto: CatatManualDto) => dto.tipe_absen === TipeAbsen.MAPEL)
  @IsMongoId()
  jadwal_id?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AbsensiEntryDto)
  entries: AbsensiEntryDto[];
}
