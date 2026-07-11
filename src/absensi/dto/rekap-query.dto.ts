import { IsDateString, IsMongoId, IsOptional } from 'class-validator';

export class RekapQueryDto {
  @IsMongoId()
  kelas_id: string;

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
  @IsMongoId()
  siswa_id?: string;
}
