import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  password_lama: string;

  @IsString()
  @MinLength(8, { message: 'Password baru minimal 8 karakter' })
  password_baru: string;
}
