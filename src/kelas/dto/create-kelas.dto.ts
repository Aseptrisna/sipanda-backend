import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateKelasDto {
  @IsString()
  @IsNotEmpty()
  nama_kelas: string;

  @IsString()
  @IsNotEmpty()
  tingkat: string;

  @IsString()
  @IsNotEmpty()
  tahun_ajaran: string;

  @IsOptional()
  @IsMongoId()
  wali_kelas_id?: string;
}
