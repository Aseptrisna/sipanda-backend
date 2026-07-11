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
import { JadwalService } from './jadwal.service';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';
import { FindJadwalQueryDto } from './dto/find-jadwal-query.dto';

@Controller('jadwal')
export class JadwalController {
  constructor(private readonly jadwalService: JadwalService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() dto: CreateJadwalDto) {
    return this.jadwalService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  findAll(@Query() query: FindJadwalQueryDto) {
    return this.jadwalService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.jadwalService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateJadwalDto,
  ) {
    return this.jadwalService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.jadwalService.remove(id);
  }
}
