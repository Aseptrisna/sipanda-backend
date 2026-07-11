import { PartialType } from '@nestjs/swagger';
import { CreateMapelDto } from './create-mapel.dto';

export class UpdateMapelDto extends PartialType(CreateMapelDto) {}
