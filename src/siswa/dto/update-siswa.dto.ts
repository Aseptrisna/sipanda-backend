import { PartialType } from '@nestjs/swagger';
import { CreateSiswaDto } from './create-siswa.dto';

export class UpdateSiswaDto extends PartialType(CreateSiswaDto) {}
