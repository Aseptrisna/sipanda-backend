import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Absensi, AbsensiSchema } from './schemas/absensi.schema';
import {
  AbsensiTidakDikenali,
  AbsensiTidakDikenaliSchema,
} from './schemas/absensi-tidak-dikenali.schema';
import { Siswa, SiswaSchema } from '../siswa/schemas/siswa.schema';
import { Jadwal, JadwalSchema } from '../jadwal/schemas/jadwal.schema';
import {
  OrangTua,
  OrangTuaSchema,
} from '../orang-tua/schemas/orang-tua.schema';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';
import { AbsensiService } from './absensi.service';
import { AbsensiController } from './absensi.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Absensi.name, schema: AbsensiSchema },
      { name: AbsensiTidakDikenali.name, schema: AbsensiTidakDikenaliSchema },
      { name: Siswa.name, schema: SiswaSchema },
      { name: Jadwal.name, schema: JadwalSchema },
      { name: OrangTua.name, schema: OrangTuaSchema },
    ]),
    NotifikasiModule,
  ],
  providers: [AbsensiService],
  controllers: [AbsensiController],
  exports: [AbsensiService],
})
export class AbsensiModule {}
