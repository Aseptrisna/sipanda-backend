import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { MapelService } from './mapel.service';
import { CreateMapelDto } from './dto/create-mapel.dto';
import { UpdateMapelDto } from './dto/update-mapel.dto';

@Controller('mapel')
export class MapelController {
  constructor(private readonly mapelService: MapelService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() dto: CreateMapelDto) {
    return this.mapelService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  findAll(@Query() query: PaginationQueryDto) {
    return this.mapelService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.mapelService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateMapelDto,
  ) {
    return this.mapelService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.mapelService.remove(id);
  }
}
