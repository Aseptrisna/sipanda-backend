import { IsDateString, IsOptional } from 'class-validator';

export class GenerateHarianDto {
  @IsOptional()
  @IsDateString(
    { strict: true },
    { message: 'tanggal harus berformat YYYY-MM-DD' },
  )
  tanggal?: string;
}
