import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { TipeAbsen } from '../../common/enums';

export class RiwayatAnakQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  siswa_id?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  tanggal_mulai?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  tanggal_selesai?: string;

  @IsOptional()
  @IsEnum(TipeAbsen)
  tipe_absen?: TipeAbsen;
}
