import { IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class FindSiswaQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  kelas_id?: string;
}
