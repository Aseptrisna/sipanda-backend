import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Kelas, KelasSchema } from './schemas/kelas.schema';
import { KelasService } from './kelas.service';
import { KelasController } from './kelas.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Kelas.name, schema: KelasSchema }]),
  ],
  providers: [KelasService],
  controllers: [KelasController],
  exports: [KelasService],
})
export class KelasModule {}
