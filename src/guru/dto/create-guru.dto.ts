import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { StatusGuru } from '../../common/enums';

export class CreateGuruDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsString()
  @IsNotEmpty()
  nip: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  mapel_ids?: string[];

  @IsOptional()
  @IsEnum(StatusGuru)
  status?: StatusGuru;

  @IsOptional()
  @IsBoolean()
  is_wali_kelas?: boolean;
}
