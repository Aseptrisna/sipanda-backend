import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Absensi, AbsensiSchema } from '../absensi/schemas/absensi.schema';
import { Kelas, KelasSchema } from '../kelas/schemas/kelas.schema';
import { Siswa, SiswaSchema } from '../siswa/schemas/siswa.schema';
import { AbsensiModule } from '../absensi/absensi.module';
import { LaporanService } from './laporan.service';
import { LaporanController } from './laporan.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Absensi.name, schema: AbsensiSchema },
      { name: Kelas.name, schema: KelasSchema },
      { name: Siswa.name, schema: SiswaSchema },
    ]),
    AbsensiModule,
  ],
  providers: [LaporanService],
  controllers: [LaporanController],
})
export class LaporanModule {}
