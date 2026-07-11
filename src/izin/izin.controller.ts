import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { IzinService } from './izin.service';
import { CreateIzinDto } from './dto/create-izin.dto';
import { ProsesIzinDto } from './dto/proses-izin.dto';
import { FindIzinQueryDto } from './dto/find-izin-query.dto';

@Controller('izin')
export class IzinController {
  constructor(private readonly izinService: IzinService) {}

  @Post()
  @Roles(Role.ORANG_TUA)
  create(
    @Body() dto: CreateIzinDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.izinService.create(dto, currentUser);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS, Role.ORANG_TUA)
  findAll(
    @Query() query: FindIzinQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.izinService.findAll(query, currentUser);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.izinService.findOne(id);
  }

  @Patch(':id/proses')
  @Roles(Role.WALI_KELAS)
  proses(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: ProsesIzinDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.izinService.proses(id, dto, currentUser);
  }
}
