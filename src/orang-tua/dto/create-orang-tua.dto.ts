import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrangTuaDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  no_hp: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  siswa_ids?: string[];
}
