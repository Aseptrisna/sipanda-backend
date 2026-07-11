import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { StatusIzin } from '../../common/enums';

export class FindIzinQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  siswa_id?: string;

  @IsOptional()
  @IsEnum(StatusIzin)
  status?: StatusIzin;
}
