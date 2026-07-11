import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { AbsensiService } from './absensi.service';
import { CatatManualDto } from './dto/catat-manual.dto';
import { KoreksiDto } from './dto/koreksi.dto';
import { FindAbsensiQueryDto } from './dto/find-absensi-query.dto';
import { RekapQueryDto } from './dto/rekap-query.dto';
import { VerifikasiWajahDto } from './dto/verifikasi-wajah.dto';
import { AssignTidakDikenaliDto } from './dto/assign-tidak-dikenali.dto';
import { GenerateHarianDto } from './dto/generate-harian.dto';
import { RiwayatAnakQueryDto } from './dto/riwayat-anak-query.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('absensi')
export class AbsensiController {
  constructor(
    private readonly absensiService: AbsensiService,
    private readonly configService: ConfigService,
  ) {}

  @Post('generate-harian')
  @Roles(Role.SUPER_ADMIN)
  generateHarian(@Body() dto: GenerateHarianDto) {
    return this.absensiService.generateHarian(dto.tanggal);
  }

  @Post('manual')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  catatManual(
    @Body() dto: CatatManualDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.absensiService.catatManual(dto, currentUser);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  findAll(@Query() query: FindAbsensiQueryDto) {
    return this.absensiService.findAll(query);
  }

  @Get('rekap')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  rekap(@Query() query: RekapQueryDto) {
    return this.absensiService.rekap(query);
  }

  @Get('anak-saya')
  @Roles(Role.ORANG_TUA)
  findRiwayatAnak(
    @Query() query: RiwayatAnakQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.absensiService.findRiwayatAnak(query, currentUser);
  }

  @Get('tidak-dikenali')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  findTidakDikenali(@Query() query: PaginationQueryDto) {
    return this.absensiService.findTidakDikenali(query);
  }

  @Patch('tidak-dikenali/:id/assign')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  assignTidakDikenali(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: AssignTidakDikenaliDto,
  ) {
    const threshold = Number(
      this.configService.getOrThrow<string>('FACE_MATCH_THRESHOLD'),
    );
    return this.absensiService.assignTidakDikenali(id, dto, threshold);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.absensiService.findOne(id);
  }

  @Patch(':id/koreksi')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  koreksi(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: KoreksiDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.absensiService.koreksi(id, dto, currentUser);
  }

  @Patch(':id/verifikasi-wajah')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  verifikasiWajah(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: VerifikasiWajahDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.absensiService.verifikasiWajah(id, dto, currentUser);
  }
}
