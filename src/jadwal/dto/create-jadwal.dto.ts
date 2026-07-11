import { IsEnum, IsMongoId, IsNotEmpty, Matches } from 'class-validator';
import { HariSekolah } from '../../common/enums';

const JAM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateJadwalDto {
  @IsMongoId()
  kelas_id: string;

  @IsMongoId()
  mapel_id: string;

  @IsMongoId()
  guru_id: string;

  @IsEnum(HariSekolah)
  hari: HariSekolah;

  @IsNotEmpty()
  @Matches(JAM_REGEX, { message: 'jam_mulai harus berformat HH:mm' })
  jam_mulai: string;

  @IsNotEmpty()
  @Matches(JAM_REGEX, { message: 'jam_selesai harus berformat HH:mm' })
  jam_selesai: string;
}
