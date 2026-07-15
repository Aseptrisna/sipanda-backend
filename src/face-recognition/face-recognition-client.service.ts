import { HttpService } from '@nestjs/axios';
import {
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
    return this.request<UploadTrainingResponse>('post', '/training/upload', {
      student_id: studentId,
      foto_urls: fotoUrls,
      nama_display: namaDisplay,
    });
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
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: `${this.baseUrl}${path}`,
          data,
        }),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Gagal memanggil face-service [${method.toUpperCase()} ${path}]: ${axiosError.message}`,
        axiosError.response
          ? JSON.stringify(axiosError.response.data)
          : axiosError.stack,
      );
      throw new ServiceUnavailableException(
        `Face recognition service tidak dapat dihubungi: ${axiosError.message}`,
      );
    }
  }
}
