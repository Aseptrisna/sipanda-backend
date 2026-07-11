import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Jadwal, JadwalSchema } from './schemas/jadwal.schema';
import { JadwalService } from './jadwal.service';
import { JadwalController } from './jadwal.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Jadwal.name, schema: JadwalSchema }]),
  ],
  providers: [JadwalService],
  controllers: [JadwalController],
  exports: [JadwalService],
})
export class JadwalModule {}
