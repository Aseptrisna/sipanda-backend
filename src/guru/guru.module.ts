import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Guru, GuruSchema } from './schemas/guru.schema';
import { GuruService } from './guru.service';
import { GuruController } from './guru.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Guru.name, schema: GuruSchema }]),
  ],
  providers: [GuruService],
  controllers: [GuruController],
  exports: [GuruService],
})
export class GuruModule {}
