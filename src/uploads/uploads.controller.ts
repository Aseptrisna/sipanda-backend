import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Controller('uploads')
export class UploadsController {
  @Post('photos')
  @UseInterceptors(
    FilesInterceptor('files', 60, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(
            new BadRequestException('Hanya file JPEG/PNG/WebP yang diizinkan'),
            false,
          );
          return;
        }
        callback(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadPhotos(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Minimal 1 file diperlukan');
    }

    const baseUrl = process.env.BACKEND_PUBLIC_URL ?? 'http://localhost:3000';
    return {
      urls: files.map((file) => `${baseUrl}/uploads/${file.filename}`),
    };
  }
}
