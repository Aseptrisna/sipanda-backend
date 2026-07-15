import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Izin, IzinDocument } from './schemas/izin.schema';
import { Siswa, SiswaDocument } from '../siswa/schemas/siswa.schema';
import { AbsensiService } from '../absensi/absensi.service';
import { UsersService } from '../users/users.service';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { CreateIzinDto } from './dto/create-izin.dto';
import { ProsesIzinDto } from './dto/proses-izin.dto';
import { FindIzinQueryDto } from './dto/find-izin-query.dto';
import { Role } from '../common/enums/role.enum';
import { StatusIzin } from '../common/enums';
import { paginate } from '../common/utils/paginate';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class IzinService {
  private readonly logger = new Logger(IzinService.name);

  constructor(
    @InjectModel(Izin.name) private readonly izinModel: Model<IzinDocument>,
    @InjectModel(Siswa.name) private readonly siswaModel: Model<SiswaDocument>,
    private readonly absensiService: AbsensiService,
    private readonly usersService: UsersService,
    private readonly notifikasiService: NotifikasiService,
  ) {}

  async create(dto: CreateIzinDto, currentUser: AuthenticatedUser) {
    const siswa = await this.siswaModel.findById(dto.siswa_id).exec();

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    if (
      !siswa.orang_tua_id ||
      siswa.orang_tua_id.toString() !== currentUser.refId
    ) {
      throw new ForbiddenException(
        'Anda tidak terdaftar sebagai orang tua siswa ini',
      );
    }

    return this.izinModel.create({
      siswa_id: siswa._id,
      diajukan_oleh: new Types.ObjectId(currentUser.userId),
      jenis: dto.jenis,
      tanggal_mulai: dto.tanggal_mulai,
      tanggal_selesai: dto.tanggal_selesai,
      lampiran_url: dto.lampiran_url ?? null,
    });
  }

  findAll(query: FindIzinQueryDto, currentUser: AuthenticatedUser) {
    const filter: Record<string, unknown> = {};

    if (currentUser.role === Role.ORANG_TUA) {
      filter.diajukan_oleh = currentUser.userId;
    } else if (query.siswa_id) {
      filter.siswa_id = query.siswa_id;
    }

    if (query.status) filter.status = query.status;

    return paginate(this.izinModel, filter, query.page, query.limit);
  }

  async findOne(id: string) {
    const izin = await this.izinModel.findById(id).exec();

    if (!izin) {
      throw new NotFoundException('Pengajuan izin tidak ditemukan');
    }

    return izin;
  }

  async proses(id: string, dto: ProsesIzinDto, currentUser: AuthenticatedUser) {
    const izin = await this.izinModel.findById(id).exec();

    if (!izin) {
      throw new NotFoundException('Pengajuan izin tidak ditemukan');
    }

    if (izin.status !== StatusIzin.MENUNGGU) {
      throw new BadRequestException(
        'Pengajuan izin ini sudah diproses sebelumnya',
      );
    }

    izin.status = dto.status;
    izin.catatan = dto.catatan ?? null;
    izin.diproses_oleh = new Types.ObjectId(currentUser.userId);
    izin.diproses_pada = new Date();
    await izin.save();

    void this.kirimNotifikasiProses(izin);

    if (dto.status === StatusIzin.DISETUJUI) {
      const hasil = await this.absensiService.applyIzin({
        siswaId: izin.siswa_id.toString(),
        tanggalMulai: izin.tanggal_mulai,
        tanggalSelesai: izin.tanggal_selesai,
        status: izin.jenis,
        izinId: izin._id.toString(),
      });

      return { izin, absensi_diupdate: hasil.jumlah_diupdate };
    }

    return { izin, absensi_diupdate: 0 };
  }

  private async kirimNotifikasiProses(izin: IzinDocument) {
    try {
      const [siswa, pengaju] = await Promise.all([
        this.siswaModel.findById(izin.siswa_id).exec(),
        this.usersService.findById(izin.diajukan_oleh.toString()),
      ]);

      if (!siswa || !pengaju) return;

      await this.notifikasiService.kirimNotifikasiIzinDiproses(
        pengaju.email,
        siswa.nama,
        izin.tanggal_mulai,
        izin.tanggal_selesai,
        izin.status,
        izin.catatan,
      );
    } catch (error) {
      this.logger.error(
        `Gagal mengirim notifikasi izin diproses: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
