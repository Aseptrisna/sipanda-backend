import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ExcelJS from 'exceljs';
import { Model, Types } from 'mongoose';
import { Absensi, AbsensiDocument } from '../absensi/schemas/absensi.schema';
import { Kelas, KelasDocument } from '../kelas/schemas/kelas.schema';
import { Siswa, SiswaDocument } from '../siswa/schemas/siswa.schema';
import { AbsensiService } from '../absensi/absensi.service';
import { DashboardAdminQueryDto } from './dto/dashboard-admin-query.dto';
import { DashboardWaliKelasQueryDto } from './dto/dashboard-wali-kelas-query.dto';
import { ExportLaporanQueryDto } from './dto/export-laporan-query.dto';
import { RekapBulananQueryDto } from './dto/rekap-bulanan-query.dto';
import { StatusAbsensi, TipeAbsen } from '../common/enums';

const STATUS_KOLOM = [
  StatusAbsensi.HADIR,
  StatusAbsensi.SAKIT,
  StatusAbsensi.IZIN,
  StatusAbsensi.ALPA,
  StatusAbsensi.TERLAMBAT,
] as const;

function rentangBulan(bulan: number, tahun: number) {
  const tanggalMulai = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
  const hariTerakhir = new Date(tahun, bulan, 0).getDate();
  const tanggalSelesai = `${tahun}-${String(bulan).padStart(2, '0')}-${String(hariTerakhir).padStart(2, '0')}`;
  return { tanggalMulai, tanggalSelesai };
}

@Injectable()
export class LaporanService {
  constructor(
    @InjectModel(Absensi.name)
    private readonly absensiModel: Model<AbsensiDocument>,
    @InjectModel(Kelas.name) private readonly kelasModel: Model<KelasDocument>,
    @InjectModel(Siswa.name) private readonly siswaModel: Model<SiswaDocument>,
    private readonly absensiService: AbsensiService,
  ) {}

  async dashboardAdmin(query: DashboardAdminQueryDto) {
    const match = {
      tanggal: { $gte: query.tanggal_mulai, $lte: query.tanggal_selesai },
    };

    const ringkasan = await this.absensiModel.aggregate([
      { $match: match },
      { $group: { _id: '$status', jumlah: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', jumlah: 1 } },
    ]);

    const trenHarianRaw = await this.absensiModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { tanggal: '$tanggal', status: '$status' },
          jumlah: { $sum: 1 },
        },
      },
    ]);

    const trenMap = new Map<
      string,
      Array<{ status: string; jumlah: number }>
    >();
    for (const row of trenHarianRaw as Array<{
      _id: { tanggal: string; status: string };
      jumlah: number;
    }>) {
      const tanggal = row._id.tanggal;
      if (!trenMap.has(tanggal)) trenMap.set(tanggal, []);
      trenMap
        .get(tanggal)!
        .push({ status: row._id.status, jumlah: row.jumlah });
    }
    const tren_harian = [...trenMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tanggal, rincian]) => ({ tanggal, rincian }));

    const kelasAlpaRaw = await this.absensiModel.aggregate([
      { $match: { ...match, status: StatusAbsensi.ALPA } },
      { $group: { _id: '$kelas_id', jumlah_alpa: { $sum: 1 } } },
      { $sort: { jumlah_alpa: -1 } },
      { $limit: 10 },
    ]);

    const kelasIds = (kelasAlpaRaw as Array<{ _id: Types.ObjectId }>).map(
      (r) => r._id,
    );
    const kelasList = await this.kelasModel
      .find({ _id: { $in: kelasIds } })
      .exec();
    const kelasNamaMap = new Map(
      kelasList.map((k) => [k._id.toString(), k.nama_kelas]),
    );

    const kelas_alpa_tertinggi = (
      kelasAlpaRaw as Array<{ _id: Types.ObjectId; jumlah_alpa: number }>
    ).map((r) => ({
      kelas_id: r._id.toString(),
      nama_kelas: kelasNamaMap.get(r._id.toString()) ?? null,
      jumlah_alpa: r.jumlah_alpa,
    }));

    return {
      periode: { dari: query.tanggal_mulai, sampai: query.tanggal_selesai },
      ringkasan,
      tren_harian,
      kelas_alpa_tertinggi,
    };
  }

  async dashboardWaliKelas(query: DashboardWaliKelasQueryDto) {
    const match = {
      kelas_id: new Types.ObjectId(query.kelas_id),
      tanggal: { $gte: query.tanggal_mulai, $lte: query.tanggal_selesai },
    };

    const ringkasan = await this.absensiModel.aggregate([
      { $match: match },
      { $group: { _id: '$status', jumlah: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', jumlah: 1 } },
    ]);

    const perSiswa = await this.absensiService.rekap({
      kelas_id: query.kelas_id,
      tanggal_mulai: query.tanggal_mulai,
      tanggal_selesai: query.tanggal_selesai,
    });

    return {
      kelas_id: query.kelas_id,
      periode: { dari: query.tanggal_mulai, sampai: query.tanggal_selesai },
      ringkasan,
      per_siswa: perSiswa.data,
    };
  }

  async rekapBulanan(query: RekapBulananQueryDto) {
    const { kelas_id, bulan, tahun } = query;
    const { tanggalMulai, tanggalSelesai } = rentangBulan(bulan, tahun);

    const siswaList = await this.siswaModel
      .find({ kelas_id: new Types.ObjectId(kelas_id) })
      .sort({ nama: 1 })
      .exec();

    const counts = await this.absensiModel.aggregate([
      {
        $match: {
          kelas_id: new Types.ObjectId(kelas_id),
          tanggal: { $gte: tanggalMulai, $lte: tanggalSelesai },
          tipe_absen: TipeAbsen.MASUK,
        },
      },
      {
        $group: {
          _id: { siswa_id: '$siswa_id', status: '$status' },
          jumlah: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, Record<string, number>>();
    for (const row of counts as Array<{
      _id: { siswa_id: Types.ObjectId; status: string };
      jumlah: number;
    }>) {
      const siswaId = row._id.siswa_id.toString();
      if (!countMap.has(siswaId)) countMap.set(siswaId, {});
      countMap.get(siswaId)![row._id.status] = row.jumlah;
    }

    const data = siswaList.map((siswa) => {
      const rincian = countMap.get(siswa._id.toString()) ?? {};
      const perStatus = Object.fromEntries(
        STATUS_KOLOM.map((status) => [status, rincian[status] ?? 0]),
      ) as Record<(typeof STATUS_KOLOM)[number], number>;
      const total = STATUS_KOLOM.reduce(
        (sum, status) => sum + perStatus[status],
        0,
      );

      return {
        siswa_id: siswa._id.toString(),
        nisn: siswa.nisn,
        nama: siswa.nama,
        ...perStatus,
        total,
      };
    });

    return {
      kelas_id,
      bulan,
      tahun,
      periode: { dari: tanggalMulai, sampai: tanggalSelesai },
      data,
    };
  }

  async exportRekapBulananExcel(query: RekapBulananQueryDto): Promise<Buffer> {
    const rekap = await this.rekapBulanan(query);
    const kelas = await this.kelasModel.findById(query.kelas_id).exec();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(
      `Rekap ${query.bulan}-${query.tahun}`,
    );

    sheet.mergeCells('A1:H1');
    sheet.getCell('A1').value =
      `Rekap Absensi Bulanan — ${kelas?.nama_kelas ?? '-'} — ${query.bulan}/${query.tahun}`;
    sheet.getCell('A1').font = { bold: true, size: 13 };

    sheet.getRow(3).values = [
      'NISN',
      'Nama Siswa',
      'Hadir',
      'Sakit',
      'Izin',
      'Alpa',
      'Terlambat',
      'Total',
    ];
    sheet.getRow(3).font = { bold: true };
    sheet.columns = [
      { key: 'nisn', width: 15 },
      { key: 'nama', width: 25 },
      { key: 'hadir', width: 10 },
      { key: 'sakit', width: 10 },
      { key: 'izin', width: 10 },
      { key: 'alpa', width: 10 },
      { key: 'terlambat', width: 10 },
      { key: 'total', width: 10 },
    ];

    for (const row of rekap.data) {
      sheet.addRow([
        row.nisn,
        row.nama,
        row.hadir,
        row.sakit,
        row.izin,
        row.alpa,
        row.terlambat,
        row.total,
      ]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportExcel(query: ExportLaporanQueryDto): Promise<Buffer> {
    const filter: Record<string, unknown> = {
      kelas_id: new Types.ObjectId(query.kelas_id),
      tanggal: { $gte: query.tanggal_mulai, $lte: query.tanggal_selesai },
    };

    if (query.siswa_id) {
      filter.siswa_id = new Types.ObjectId(query.siswa_id);
    }

    const rows = await this.absensiModel
      .find(filter)
      .sort({ tanggal: 1 })
      .exec();
    const siswaList = await this.siswaModel
      .find({ kelas_id: query.kelas_id })
      .exec();
    const siswaMap = new Map(siswaList.map((s) => [s._id.toString(), s]));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Laporan Absensi');
    sheet.columns = [
      { header: 'Tanggal', key: 'tanggal', width: 12 },
      { header: 'NISN', key: 'nisn', width: 15 },
      { header: 'Nama Siswa', key: 'nama', width: 25 },
      { header: 'Tipe', key: 'tipe_absen', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Sumber', key: 'sumber', width: 10 },
      { header: 'Keterangan', key: 'keterangan', width: 30 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const row of rows) {
      const siswa = siswaMap.get(row.siswa_id.toString());
      sheet.addRow({
        tanggal: row.tanggal,
        nisn: siswa?.nisn ?? '-',
        nama: siswa?.nama ?? '-',
        tipe_absen: row.tipe_absen,
        status: row.status,
        sumber: row.sumber,
        keterangan: row.keterangan ?? '',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
