import { PartialType } from '@nestjs/swagger';
import { CreateOrangTuaDto } from './create-orang-tua.dto';

export class UpdateOrangTuaDto extends PartialType(CreateOrangTuaDto) {}
