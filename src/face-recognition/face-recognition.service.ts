import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FaceRecognitionClientService } from './face-recognition-client.service';
import {
  FaceTraining,
  FaceTrainingDocument,
} from './schemas/face-training.schema';
import { Siswa, SiswaDocument } from '../siswa/schemas/siswa.schema';
import { AbsensiService } from '../absensi/absensi.service';
import { UploadTrainingDto } from './dto/upload-training.dto';
import { TriggerTrainingDto } from './dto/trigger-training.dto';
import { TrainingCompleteWebhookDto } from './dto/training-complete-webhook.dto';
import { MatchAbsensiDto } from './dto/match-absensi.dto';
import { StatusFaceTraining, StatusWajah, TipeAbsen } from '../common/enums';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class FaceRecognitionService {
  constructor(
    private readonly client: FaceRecognitionClientService,
    private readonly configService: ConfigService,
    private readonly absensiService: AbsensiService,
    @InjectModel(FaceTraining.name)
    private readonly faceTrainingModel: Model<FaceTrainingDocument>,
    @InjectModel(Siswa.name)
    private readonly siswaModel: Model<SiswaDocument>,
  ) {}

  async uploadTraining(dto: UploadTrainingDto, currentUser: AuthenticatedUser) {
    const siswa = await this.siswaModel.findById(dto.siswa_id).exec();

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const result = await this.client.uploadTraining(
      dto.siswa_id,
      dto.foto_urls,
      siswa.nama,
    );

    await this.faceTrainingModel.create({
      siswa_id: siswa._id,
      foto_urls: dto.foto_urls,
      versi: result.version,
      status: StatusFaceTraining.PENDING,
      requested_by: new Types.ObjectId(currentUser.userId),
    });

    siswa.status_wajah = StatusWajah.MENUNGGU_TRAINING;
    await siswa.save();

    return result;
  }

  async triggerTraining(dto: TriggerTrainingDto) {
    return this.client.triggerTraining(dto.siswa_ids);
  }

  async getStatus(siswaId: string) {
    const siswa = await this.siswaModel.findById(siswaId).exec();

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    return this.client.getTrainingStatus(siswaId);
  }

  async handleTrainingCompleteWebhook(dto: TrainingCompleteWebhookDto) {
    const siswa = await this.siswaModel.findById(dto.student_id).exec();

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const faceTraining = await this.faceTrainingModel
      .findOne({ siswa_id: siswa._id, versi: dto.version })
      .sort({ created_at: -1 })
      .exec();

    const statusFaceTraining =
      dto.status === 'trained'
        ? StatusFaceTraining.TRAINED
        : StatusFaceTraining.FAILED;

    if (faceTraining) {
      faceTraining.status = statusFaceTraining;
      faceTraining.model_version = dto.model_version ?? null;
      faceTraining.error_message = dto.error_message ?? null;
      faceTraining.completed_at = new Date();
      await faceTraining.save();
    }

    siswa.status_wajah =
      dto.status === 'trained'
        ? StatusWajah.TERDAFTAR
        : StatusWajah.PERLU_RETAKE;
    await siswa.save();

    return { received: true };
  }

  async deleteTraining(siswaId: string) {
    const siswa = await this.siswaModel.findById(siswaId).exec();

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    await this.client.deleteTraining(siswaId);

    siswa.status_wajah = StatusWajah.BELUM_TERDAFTAR;
    await siswa.save();

    return { deleted: true };
  }

  async matchAbsensi(dto: MatchAbsensiDto) {
    if (dto.tipe_absen === TipeAbsen.MAPEL) {
      throw new BadRequestException(
        'Absensi wajah hanya berlaku untuk tipe_absen masuk atau pulang',
      );
    }

    const result = await this.client.matchInference(dto.image_base64);
    const threshold = Number(
      this.configService.getOrThrow<string>('FACE_MATCH_THRESHOLD'),
    );

    return this.absensiService.applyFaceMatch({
      siswaId: result.student_id,
      tipeAbsen: dto.tipe_absen,
      confidence: result.confidence,
      fotoCaptureUrl: dto.foto_capture_url,
      threshold,
    });
  }
}
