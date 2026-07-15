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
import { OrangTuaService } from './orang-tua.service';
import { CreateOrangTuaDto } from './dto/create-orang-tua.dto';
import { UpdateOrangTuaDto } from './dto/update-orang-tua.dto';

@Controller('orang-tua')
export class OrangTuaController {
  constructor(private readonly orangTuaService: OrangTuaService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() dto: CreateOrangTuaDto) {
    return this.orangTuaService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  findAll(@Query() query: PaginationQueryDto) {
    return this.orangTuaService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.orangTuaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateOrangTuaDto,
  ) {
    return this.orangTuaService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.orangTuaService.remove(id);
  }

  @Post(':id/reset-password')
  @Roles(Role.SUPER_ADMIN)
  resetPassword(@Param('id', ParseObjectIdPipe) id: string) {
    return this.orangTuaService.resetPassword(id);
  }
}
