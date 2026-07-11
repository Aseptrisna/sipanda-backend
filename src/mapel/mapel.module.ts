import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mapel, MapelSchema } from './schemas/mapel.schema';
import { MapelService } from './mapel.service';
import { MapelController } from './mapel.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mapel.name, schema: MapelSchema }]),
  ],
  providers: [MapelService],
  controllers: [MapelController],
  exports: [MapelService],
})
export class MapelModule {}
