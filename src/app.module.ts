import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KelasModule } from './kelas/kelas.module';
import { GuruModule } from './guru/guru.module';
import { MapelModule } from './mapel/mapel.module';
import { JadwalModule } from './jadwal/jadwal.module';
import { SiswaModule } from './siswa/siswa.module';
import { OrangTuaModule } from './orang-tua/orang-tua.module';
import { AbsensiModule } from './absensi/absensi.module';
import { FaceRecognitionModule } from './face-recognition/face-recognition.module';
import { IzinModule } from './izin/izin.module';
import { LaporanModule } from './laporan/laporan.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    KelasModule,
    GuruModule,
    MapelModule,
    JadwalModule,
    SiswaModule,
    OrangTuaModule,
    AbsensiModule,
    FaceRecognitionModule,
    IzinModule,
    LaporanModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
