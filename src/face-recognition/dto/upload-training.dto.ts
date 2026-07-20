import { ArrayMinSize, IsArray, IsMongoId, IsUrl } from 'class-validator';

export class UploadTrainingDto {
  @IsMongoId()
  siswa_id: string;

  // Raised from 3 — real retrains on the live model repeatedly showed
  // students with ~20 photos being the ones that collapsed into other
  // classes or got swallowed by class imbalance, while 40-60 photo
  // students classified reliably. 20 is the enforced floor; the frontend
  // still recommends 40+.
  @IsArray()
  @ArrayMinSize(20, {
    message: 'Minimal 20 foto (dari berbagai sudut & ekspresi) diperlukan',
  })
  @IsUrl({ require_tld: false }, { each: true })
  foto_urls: string[];
}
