import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateSiswaDto {
  @IsString()
  @IsNotEmpty()
  nisn: string;

  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsMongoId()
  kelas_id: string;

  @IsOptional()
  @IsMongoId()
  orang_tua_id?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  foto_profil_url?: string;
}
