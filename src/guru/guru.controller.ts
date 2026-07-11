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
import { GuruService } from './guru.service';
import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';

@Controller('guru')
export class GuruController {
  constructor(private readonly guruService: GuruService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() dto: CreateGuruDto) {
    return this.guruService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  findAll(@Query() query: PaginationQueryDto) {
    return this.guruService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.guruService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateGuruDto,
  ) {
    return this.guruService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.guruService.remove(id);
  }
}
