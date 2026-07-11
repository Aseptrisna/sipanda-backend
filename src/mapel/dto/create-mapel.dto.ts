import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMapelDto {
  @IsString()
  @IsNotEmpty()
  nama_mapel: string;

  @IsString()
  @IsNotEmpty()
  kode_mapel: string;

  @IsOptional()
  @IsMongoId()
  guru_id?: string;
}
