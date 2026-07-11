import { IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class FindJadwalQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  kelas_id?: string;
}
