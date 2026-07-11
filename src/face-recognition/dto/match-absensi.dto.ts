import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { TipeAbsen } from '../../common/enums';

export class MatchAbsensiDto {
  @IsString()
  @IsNotEmpty()
  image_base64: string;

  @IsUrl({ require_tld: false })
  foto_capture_url: string;

  @IsEnum(TipeAbsen)
  tipe_absen: TipeAbsen;
}
