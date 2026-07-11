import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Izin, IzinSchema } from './schemas/izin.schema';
import { Siswa, SiswaSchema } from '../siswa/schemas/siswa.schema';
import { AbsensiModule } from '../absensi/absensi.module';
import { UsersModule } from '../users/users.module';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';
import { IzinService } from './izin.service';
import { IzinController } from './izin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Izin.name, schema: IzinSchema },
      { name: Siswa.name, schema: SiswaSchema },
    ]),
    AbsensiModule,
    UsersModule,
    NotifikasiModule,
  ],
  providers: [IzinService],
  controllers: [IzinController],
})
export class IzinModule {}
