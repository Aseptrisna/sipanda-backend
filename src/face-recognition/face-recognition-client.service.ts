import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

export interface UploadTrainingResponse {
  student_id: string;
  version: number;
  status: string;
}

export interface TriggerTrainingResponse {
  job_id: string;
}

export interface TrainingStatusResponse {
  student_id: string;
  status: string;
  current_version: number;
  model_version: string | null;
  updated_at: string;
}

export interface InferenceMatchResponse {
  student_id: string | null;
  confidence: number;
}

@Injectable()
export class FaceRecognitionClientService {
  private readonly logger = new Logger(FaceRecognitionClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get baseUrl(): string {
    return this.configService.getOrThrow<string>('FACE_SERVICE_BASE_URL');
  }

  async uploadTraining(
    studentId: string,
    fotoUrls: string[],
    namaDisplay?: string,
  ): Promise<UploadTrainingResponse> {
    // face-service downloads every foto_url sequentially before responding
    // (see app/routes/training.py upload_training_photos) — the module-wide
    // 10s timeout is fine for /inference/match's single image but is too
    // tight for a batch of photos (up to 60), so this call gets a longer,
    // explicit timeout instead of racing the shared default.
    return this.request<UploadTrainingResponse>(
      'post',
      '/training/upload',
      {
        student_id: studentId,
        foto_urls: fotoUrls,
        nama_display: namaDisplay,
      },
      180_000,
    );
  }

  async triggerTraining(
    studentIds: string[],
  ): Promise<TriggerTrainingResponse> {
    return this.request<TriggerTrainingResponse>('post', '/training/trigger', {
      student_ids: studentIds,
    });
  }

  async getTrainingStatus(studentId: string): Promise<TrainingStatusResponse> {
    return this.request<TrainingStatusResponse>(
      'get',
      `/training/status/${studentId}`,
    );
  }

  async matchInference(imageBase64: string): Promise<InferenceMatchResponse> {
    return this.request<InferenceMatchResponse>('post', '/inference/match', {
      image_base64: imageBase64,
    });
  }

  async deleteTraining(studentId: string): Promise<void> {
    await this.request('delete', `/training/${studentId}`);
  }

  private async request<T>(
    method: 'get' | 'post' | 'delete',
    path: string,
    data?: unknown,
    timeoutMs?: number,
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: `${this.baseUrl}${path}`,
          data,
          ...(timeoutMs !== undefined ? { timeout: timeoutMs } : {}),
        }),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      this.logger.error(
        `Gagal memanggil face-service [${method.toUpperCase()} ${path}]: ${axiosError.message}`,
        axiosError.response
          ? JSON.stringify(axiosError.response.data)
          : axiosError.stack,
      );

      // face-service actually responded (4xx/5xx) — surface its real status
      // and message instead of masking it as a generic "unreachable" error,
      // otherwise e.g. a 409 "training lain sedang berjalan" looks identical
      // to face-service being down to the frontend.
      if (axiosError.response) {
        throw new HttpException(
          axiosError.response.data?.detail ?? axiosError.message,
          axiosError.response.status,
        );
      }

      throw new ServiceUnavailableException(
        `Face recognition service tidak dapat dihubungi: ${axiosError.message}`,
      );
    }
  }
}
