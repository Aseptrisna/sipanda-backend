import { Controller, Get, Query, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { LaporanService } from './laporan.service';
import { DashboardAdminQueryDto } from './dto/dashboard-admin-query.dto';
import { DashboardWaliKelasQueryDto } from './dto/dashboard-wali-kelas-query.dto';
import { ExportLaporanQueryDto } from './dto/export-laporan-query.dto';
import { RekapBulananQueryDto } from './dto/rekap-bulanan-query.dto';

@Controller('laporan')
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Get('dashboard-admin')
  @Roles(Role.SUPER_ADMIN)
  dashboardAdmin(@Query() query: DashboardAdminQueryDto) {
    return this.laporanService.dashboardAdmin(query);
  }

  @Get('dashboard-wali-kelas')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  dashboardWaliKelas(@Query() query: DashboardWaliKelasQueryDto) {
    return this.laporanService.dashboardWaliKelas(query);
  }

  @Get('export')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  async export(
    @Query() query: ExportLaporanQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.laporanService.exportExcel(query);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="laporan-absensi-${query.tanggal_mulai}_${query.tanggal_selesai}.xlsx"`,
    });

    return new StreamableFile(buffer);
  }

  @Get('rekap-bulanan')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  rekapBulanan(@Query() query: RekapBulananQueryDto) {
    return this.laporanService.rekapBulanan(query);
  }

  @Get('rekap-bulanan/export')
  @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
  async exportRekapBulanan(
    @Query() query: RekapBulananQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.laporanService.exportRekapBulananExcel(query);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="rekap-bulanan-${query.kelas_id}-${query.bulan}-${query.tahun}.xlsx"`,
    });

    return new StreamableFile(buffer);
  }
}
