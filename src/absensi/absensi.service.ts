import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Absensi, AbsensiDocument } from './schemas/absensi.schema';
import {
  AbsensiTidakDikenali,
  AbsensiTidakDikenaliDocument,
} from './schemas/absensi-tidak-dikenali.schema';
import { Siswa, SiswaDocument } from '../siswa/schemas/siswa.schema';
import { Jadwal, JadwalDocument } from '../jadwal/schemas/jadwal.schema';
import {
  OrangTua,
  OrangTuaDocument,
} from '../orang-tua/schemas/orang-tua.schema';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { CatatManualDto } from './dto/catat-manual.dto';
import { KoreksiDto } from './dto/koreksi.dto';
import { FindAbsensiQueryDto } from './dto/find-absensi-query.dto';
import { RekapQueryDto } from './dto/rekap-query.dto';
import { RiwayatAnakQueryDto } from './dto/riwayat-anak-query.dto';
import { VerifikasiWajahDto } from './dto/verifikasi-wajah.dto';
import { AssignTidakDikenaliDto } from './dto/assign-tidak-dikenali.dto';
import {
  HariSekolah,
  StatusAbsensi,
  StatusVerifikasiWajah,
  SumberAbsensi,
  TipeAbsen,
} from '../common/enums';
import { paginate } from '../common/utils/paginate';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';

const HARI_BY_DAY_INDEX: Record<number, HariSekolah | null> = {
  0: null,
  1: HariSekolah.SENIN,
  2: HariSekolah.SELASA,
  3: HariSekolah.RABU,
  4: HariSekolah.KAMIS,
  5: HariSekolah.JUMAT,
  6: HariSekolah.SABTU,
};

interface ApplyFaceMatchInput {
  siswaId: string | null;
  tipeAbsen: TipeAbsen;
  confidence: number;
  fotoCaptureUrl: string;
  threshold: number;
  tanggal?: string;
}

@Injectable()
export class AbsensiService {
  private readonly logger = new Logger(AbsensiService.name);

  constructor(
    @InjectModel(Absensi.name)
    private readonly absensiModel: Model<AbsensiDocument>,
    @InjectModel(AbsensiTidakDikenali.name)
    private readonly tidakDikenaliModel: Model<AbsensiTidakDikenaliDocument>,
    @InjectModel(Siswa.name) private readonly siswaModel: Model<SiswaDocument>,
    @InjectModel(Jadwal.name)
    private readonly jadwalModel: Model<JadwalDocument>,
    @InjectModel(OrangTua.name)
    private readonly orangTuaModel: Model<OrangTuaDocument>,
    private readonly notifikasiService: NotifikasiService,
  ) {}

  private async notifikasiTidakHadir(
    siswaId: Types.ObjectId,
    tanggal: string,
    status: StatusAbsensi,
  ) {
    if (status === StatusAbsensi.HADIR || status === StatusAbsensi.TERLAMBAT) {
      return;
    }

    try {
      const siswa = await this.siswaModel.findById(siswaId).exec();

      if (!siswa?.orang_tua_id) {
        return;
      }

      const orangTua = await this.orangTuaModel
        .findById(siswa.orang_tua_id)
        .exec();

      if (!orangTua) {
        return;
      }

      await this.notifikasiService.kirimNotifikasiKetidakhadiran(
        orangTua.email,
        siswa.nama,
        tanggal,
        status,
      );
    } catch (error) {
      this.logger.error(
        `Gagal mengirim notifikasi ketidakhadiran: ${(error as Error).message}`,
      );
    }
  }

  @Cron('0 0 * * *')
  async handleCronGenerateHarian() {
    const tanggal = new Date().toISOString().slice(0, 10);
    const hasil = await this.generateHarian(tanggal);
    this.logger.log(
      `Generate harian ${tanggal}: ${hasil.jumlah_dibuat} baris dibuat`,
    );
  }

  async generateHarian(tanggal?: string) {
    const tanggalTarget = tanggal ?? new Date().toISOString().slice(0, 10);
    const [year, month, day] = tanggalTarget.split('-').map(Number);
    const dayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const hari = HARI_BY_DAY_INDEX[dayIndex];

    if (!hari) {
      return {
        tanggal: tanggalTarget,
        jumlah_dibuat: 0,
        catatan: 'Hari Minggu, tidak digenerate',
      };
    }

    const siswaList = await this.siswaModel.find({}).exec();
    const kelasIds = [...new Set(siswaList.map((s) => s.kelas_id.toString()))];
    const jadwalByKelas = new Map<string, JadwalDocument[]>();

    for (const kelasId of kelasIds) {
      const jadwalList = await this.jadwalModel
        .find({ kelas_id: kelasId, hari })
        .exec();
      jadwalByKelas.set(kelasId, jadwalList);
    }

    const ops: Array<Record<string, unknown>> = [];

    for (const siswa of siswaList) {
      const baseDefaults = {
        kelas_id: siswa.kelas_id,
        status: StatusAbsensi.ALPA,
        sumber: SumberAbsensi.DEFAULT,
        is_locked: false,
      };

      for (const tipe of [TipeAbsen.MASUK, TipeAbsen.PULANG]) {
        ops.push({
          updateOne: {
            filter: {
              siswa_id: siswa._id,
              tanggal: tanggalTarget,
              tipe_absen: tipe,
              jadwal_id: null,
            },
            update: { $setOnInsert: baseDefaults },
            upsert: true,
          },
        });
      }

      const jadwalList = jadwalByKelas.get(siswa.kelas_id.toString()) ?? [];
      for (const jadwal of jadwalList) {
        ops.push({
          updateOne: {
            filter: {
              siswa_id: siswa._id,
              tanggal: tanggalTarget,
              tipe_absen: TipeAbsen.MAPEL,
              jadwal_id: jadwal._id,
            },
            update: { $setOnInsert: baseDefaults },
            upsert: true,
          },
        });
      }
    }

    if (ops.length === 0) {
      return { tanggal: tanggalTarget, jumlah_dibuat: 0 };
    }

    const result = await this.absensiModel.bulkWrite(ops as never[]);

    return {
      tanggal: tanggalTarget,
      jumlah_dibuat: result.upsertedCount,
    };
  }

  async catatManual(dto: CatatManualDto, currentUser: AuthenticatedUser) {
    if (dto.tipe_absen === TipeAbsen.MAPEL && !dto.jadwal_id) {
      throw new BadRequestException(
        'jadwal_id wajib diisi untuk tipe_absen mapel',
      );
    }

    if (dto.tipe_absen !== TipeAbsen.MAPEL && dto.jadwal_id) {
      throw new BadRequestException(
        'jadwal_id hanya berlaku untuk tipe_absen mapel',
      );
    }

    const jadwalId = dto.jadwal_id ? new Types.ObjectId(dto.jadwal_id) : null;
    const berhasil: AbsensiDocument[] = [];
    const diabaikan: Array<{ siswa_id: string; alasan: string }> = [];

    for (const entry of dto.entries) {
      const filter = {
        siswa_id: new Types.ObjectId(entry.siswa_id),
        tanggal: dto.tanggal,
        tipe_absen: dto.tipe_absen,
        jadwal_id: jadwalId,
      };

      const existing = await this.absensiModel.findOne(filter).exec();

      if (!existing) {
        const created = await this.absensiModel.create({
          ...filter,
          kelas_id: new Types.ObjectId(dto.kelas_id),
          status: entry.status,
          sumber: SumberAbsensi.MANUAL,
          is_locked: true,
          dicatat_oleh: new Types.ObjectId(currentUser.userId),
          waktu_dicatat: new Date(),
          keterangan: entry.keterangan ?? null,
        });
        berhasil.push(created);
        void this.notifikasiTidakHadir(
          created.siswa_id,
          dto.tanggal,
          entry.status,
        );
        continue;
      }

      if (existing.is_locked) {
        diabaikan.push({
          siswa_id: entry.siswa_id,
          alasan: `Sudah tercatat oleh sumber '${existing.sumber}'`,
        });
        continue;
      }

      existing.status = entry.status;
      existing.sumber = SumberAbsensi.MANUAL;
      existing.is_locked = true;
      existing.dicatat_oleh = new Types.ObjectId(currentUser.userId);
      existing.waktu_dicatat = new Date();
      existing.keterangan = entry.keterangan ?? null;
      await existing.save();
      berhasil.push(existing);
      void this.notifikasiTidakHadir(
        existing.siswa_id,
        dto.tanggal,
        entry.status,
      );
    }

    return { berhasil, diabaikan };
  }

  async koreksi(id: string, dto: KoreksiDto, currentUser: AuthenticatedUser) {
    const absensi = await this.absensiModel.findById(id).exec();

    if (!absensi) {
      throw new NotFoundException('Catatan absensi tidak ditemukan');
    }

    absensi.status = dto.status;
    absensi.sumber = SumberAbsensi.MANUAL;
    absensi.is_locked = true;
    absensi.dicatat_oleh = new Types.ObjectId(currentUser.userId);
    absensi.waktu_dicatat = new Date();
    absensi.keterangan = dto.keterangan ?? absensi.keterangan;
    await absensi.save();
    void this.notifikasiTidakHadir(
      absensi.siswa_id,
      absensi.tanggal,
      absensi.status,
    );

    return absensi;
  }

  async applyIzin(input: {
    siswaId: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    status: StatusAbsensi;
    izinId: string;
  }) {
    const result = await this.absensiModel.updateMany(
      {
        siswa_id: new Types.ObjectId(input.siswaId),
        tanggal: { $gte: input.tanggalMulai, $lte: input.tanggalSelesai },
        is_locked: false,
      },
      {
        $set: {
          status: input.status,
          sumber: SumberAbsensi.IZIN,
          is_locked: true,
          izin_id: new Types.ObjectId(input.izinId),
        },
      },
    );

    return { jumlah_diupdate: result.modifiedCount };
  }

  async applyFaceMatch(input: ApplyFaceMatchInput) {
    const tanggal = input.tanggal ?? new Date().toISOString().slice(0, 10);
    const waktu = new Date();

    if (!input.siswaId) {
      const tidakDikenali = await this.tidakDikenaliModel.create({
        tanggal,
        waktu,
        tipe_absen: input.tipeAbsen,
        confidence_score: input.confidence,
        foto_capture_url: input.fotoCaptureUrl,
      });
      return {
        tercatat: false,
        alasan: 'Tidak ada siswa yang cocok',
        tidak_dikenali: tidakDikenali,
      };
    }

    const siswa = await this.siswaModel.findById(input.siswaId).exec();

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const siswaInfo = { _id: siswa._id, nama: siswa.nama };

    const filter = {
      siswa_id: new Types.ObjectId(input.siswaId),
      tanggal,
      tipe_absen: input.tipeAbsen,
      jadwal_id: null,
    };

    let absensi = await this.absensiModel.findOne(filter).exec();

    if (!absensi) {
      absensi = await this.absensiModel.create({
        ...filter,
        kelas_id: siswa.kelas_id,
        status: StatusAbsensi.ALPA,
        sumber: SumberAbsensi.DEFAULT,
        is_locked: false,
      });
    }

    // Record dikunci oleh sumber MANUAL (guru) tidak boleh ditimpa scan wajah
    // — supaya koreksi manual guru tidak sengaja ketiban hasil scan wajah.
    // Record yang dikunci oleh scan wajah SEBELUMNYA tetap boleh di-scan ulang
    // (absensi wajah bisa berulang), supaya siswa bisa scan lagi kalau perlu
    // (misal testing, atau scan pertama confidence-nya rendah).
    if (absensi.is_locked && absensi.sumber !== SumberAbsensi.WAJAH) {
      return {
        tercatat: false,
        alasan: `Sudah tercatat sebelumnya oleh sumber '${absensi.sumber}'`,
        absensi,
        siswa: siswaInfo,
      };
    }

    const cocok = input.confidence >= input.threshold;

    absensi.confidence_score = input.confidence;
    absensi.foto_capture_url = input.fotoCaptureUrl;

    if (cocok) {
      absensi.status = StatusAbsensi.HADIR;
      absensi.sumber = SumberAbsensi.WAJAH;
      absensi.is_locked = true;
      absensi.status_verifikasi = StatusVerifikasiWajah.TERVERIFIKASI_OTOMATIS;
    } else {
      absensi.status_verifikasi = StatusVerifikasiWajah.MENUNGGU_VERIFIKASI;
    }

    await absensi.save();

    return { tercatat: true, absensi, siswa: siswaInfo };
  }

  findAll(query: FindAbsensiQueryDto) {
    const filter: Record<string, unknown> = {};

    if (query.kelas_id) filter.kelas_id = query.kelas_id;
    if (query.siswa_id) filter.siswa_id = query.siswa_id;
    if (query.tipe_absen) filter.tipe_absen = query.tipe_absen;
    if (query.sumber) filter.sumber = query.sumber;
    if (query.status_verifikasi)
      filter.status_verifikasi = query.status_verifikasi;

    if (query.tanggal) {
      filter.tanggal = query.tanggal;
    } else if (query.tanggal_mulai || query.tanggal_selesai) {
      const range: Record<string, string> = {};
      if (query.tanggal_mulai) range.$gte = query.tanggal_mulai;
      if (query.tanggal_selesai) range.$lte = query.tanggal_selesai;
      filter.tanggal = range;
    }

    return paginate(this.absensiModel, filter, query.page, query.limit);
  }

  async findRiwayatAnak(
    query: RiwayatAnakQueryDto,
    currentUser: AuthenticatedUser,
  ) {
    const anakList = await this.siswaModel
      .find({ orang_tua_id: currentUser.refId })
      .exec();
    const anakIds = anakList.map((s) => s._id.toString());

    if (anakIds.length === 0) {
      return {
        data: [],
        meta: { page: 1, limit: query.limit ?? 20, total: 0, total_pages: 0 },
      };
    }

    if (query.siswa_id && !anakIds.includes(query.siswa_id)) {
      throw new ForbiddenException('Siswa ini bukan anak Anda');
    }

    const filter: Record<string, unknown> = {
      siswa_id: query.siswa_id ? query.siswa_id : { $in: anakIds },
    };

    if (query.tipe_absen) filter.tipe_absen = query.tipe_absen;

    if (query.tanggal_mulai || query.tanggal_selesai) {
      const range: Record<string, string> = {};
      if (query.tanggal_mulai) range.$gte = query.tanggal_mulai;
      if (query.tanggal_selesai) range.$lte = query.tanggal_selesai;
      filter.tanggal = range;
    }

    return paginate(this.absensiModel, filter, query.page, query.limit);
  }

  async findOne(id: string) {
    const absensi = await this.absensiModel.findById(id).exec();

    if (!absensi) {
      throw new NotFoundException('Catatan absensi tidak ditemukan');
    }

    return absensi;
  }

  async rekap(query: RekapQueryDto) {
    const match: Record<string, unknown> = {
      kelas_id: new Types.ObjectId(query.kelas_id),
      tanggal: { $gte: query.tanggal_mulai, $lte: query.tanggal_selesai },
    };

    if (query.siswa_id) {
      match.siswa_id = new Types.ObjectId(query.siswa_id);
    }

    const result = await this.absensiModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { siswa_id: '$siswa_id', status: '$status' },
          jumlah: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.siswa_id',
          rincian: { $push: { status: '$_id.status', jumlah: '$jumlah' } },
          total: { $sum: '$jumlah' },
        },
      },
      {
        $project: {
          _id: 0,
          siswa_id: '$_id',
          rincian: 1,
          total: 1,
        },
      },
    ]);

    return {
      kelas_id: query.kelas_id,
      periode: { dari: query.tanggal_mulai, sampai: query.tanggal_selesai },
      data: result,
    };
  }

  async verifikasiWajah(
    id: string,
    dto: VerifikasiWajahDto,
    currentUser: AuthenticatedUser,
  ) {
    const absensi = await this.absensiModel.findById(id).exec();

    if (!absensi) {
      throw new NotFoundException('Catatan absensi tidak ditemukan');
    }

    if (
      absensi.status_verifikasi !== StatusVerifikasiWajah.MENUNGGU_VERIFIKASI
    ) {
      throw new BadRequestException(
        'Catatan ini tidak sedang menunggu verifikasi',
      );
    }

    if (dto.tolak) {
      absensi.status_verifikasi = StatusVerifikasiWajah.DITOLAK;
    } else {
      if (!dto.status) {
        throw new BadRequestException('status wajib diisi untuk approval');
      }
      absensi.status = dto.status;
      absensi.sumber = SumberAbsensi.WAJAH;
      absensi.is_locked = true;
      absensi.status_verifikasi = StatusVerifikasiWajah.TERVERIFIKASI_MANUAL;
    }

    absensi.diverifikasi_oleh = new Types.ObjectId(currentUser.userId);
    await absensi.save();

    if (!dto.tolak) {
      void this.notifikasiTidakHadir(
        absensi.siswa_id,
        absensi.tanggal,
        absensi.status,
      );
    }

    return absensi;
  }

  findTidakDikenali(query: { page?: number; limit?: number }) {
    return paginate(
      this.tidakDikenaliModel,
      { sudah_ditugaskan: false },
      query.page,
      query.limit,
    );
  }

  async assignTidakDikenali(
    id: string,
    dto: AssignTidakDikenaliDto,
    threshold: number,
  ) {
    const tidakDikenali = await this.tidakDikenaliModel.findById(id).exec();

    if (!tidakDikenali) {
      throw new NotFoundException('Data tidak ditemukan');
    }

    if (tidakDikenali.sudah_ditugaskan) {
      throw new BadRequestException('Data ini sudah pernah ditugaskan');
    }

    const result = await this.applyFaceMatch({
      siswaId: dto.siswa_id,
      tipeAbsen: tidakDikenali.tipe_absen,
      confidence: tidakDikenali.confidence_score,
      fotoCaptureUrl: tidakDikenali.foto_capture_url,
      threshold,
      tanggal: tidakDikenali.tanggal,
    });

    tidakDikenali.sudah_ditugaskan = true;
    await tidakDikenali.save();

    return result;
  }
}
