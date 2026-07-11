import { PartialType } from '@nestjs/swagger';
import { CreateGuruDto } from './create-guru.dto';

export class UpdateGuruDto extends PartialType(CreateGuruDto) {}
