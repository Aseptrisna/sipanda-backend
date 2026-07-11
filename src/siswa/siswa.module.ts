import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Siswa, SiswaSchema } from './schemas/siswa.schema';
import { SiswaService } from './siswa.service';
import { SiswaController } from './siswa.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Siswa.name, schema: SiswaSchema }]),
  ],
  providers: [SiswaService],
  controllers: [SiswaController],
  exports: [SiswaService],
})
export class SiswaModule {}
