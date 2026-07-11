import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FaceTraining,
  FaceTrainingSchema,
} from './schemas/face-training.schema';
import { Siswa, SiswaSchema } from '../siswa/schemas/siswa.schema';
import { AbsensiModule } from '../absensi/absensi.module';
import { FaceRecognitionClientService } from './face-recognition-client.service';
import { FaceRecognitionService } from './face-recognition.service';
import { FaceRecognitionController } from './face-recognition.controller';
import { WebhookSecretGuard } from './guards/webhook-secret.guard';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({ timeout: 10_000 }),
    MongooseModule.forFeature([
      { name: FaceTraining.name, schema: FaceTrainingSchema },
      { name: Siswa.name, schema: SiswaSchema },
    ]),
    AbsensiModule,
  ],
  providers: [
    FaceRecognitionClientService,
    FaceRecognitionService,
    WebhookSecretGuard,
  ],
  controllers: [FaceRecognitionController],
})
export class FaceRecognitionModule {}
