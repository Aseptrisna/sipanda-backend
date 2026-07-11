import { ArrayMinSize, IsArray, IsMongoId, IsUrl } from 'class-validator';

export class UploadTrainingDto {
  @IsMongoId()
  siswa_id: string;

  @IsArray()
  @ArrayMinSize(3, {
    message: 'Minimal 3 foto (depan, kiri, kanan) diperlukan',
  })
  @IsUrl({ require_tld: false }, { each: true })
  foto_urls: string[];
}
