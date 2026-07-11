import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotifikasiService } from './notifikasi.service';

@Module({
  imports: [ConfigModule],
  providers: [NotifikasiService],
  exports: [NotifikasiService],
})
export class NotifikasiModule {}
