/**
 * Seed 24 siswa dataset "training metode cnn" ke kelas 2A, berikut orang tua-nya.
 *
 * NISN dan data orang tua di sini adalah PLACEHOLDER (tidak ada data asli yang
 * diberikan) — edit manual lewat endpoint /siswa dan /orang-tua kalau perlu
 * data sungguhan nantinya. Tujuan utama seeder ini adalah menghasilkan
 * `student_id` (Mongo ObjectId) nyata untuk setiap nama, dipakai sebagai label
 * training CNN.
 *
 * Output: mapping nama -> student_id dicetak ke stdout DAN ditulis ke
 * src/database/seeds/output/siswa-cnn-mapping.json.
 */

import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { KelasService } from '../../kelas/kelas.service';
import { OrangTuaService } from '../../orang-tua/orang-tua.service';
import { SiswaService } from '../../siswa/siswa.service';

const NAMA_SISWA = [
  'Abraham Abrisyam Hidayat',
  'Ahmad Hilalludin',
  'Aira Zeannisa Balqis',
  'Alby Luthfy Fachri',
  'Amel Ramadani',
  'Arfi Al-Fatha .S',
  'Bani Khafidz Gumelar',
  'Dendi Satria Atmayoga',
  'Hammam Adrian Firdaus',
  'Hamzah  Al-Bukhori',
  'Kanaya Aletha Qirani',
  'M. Filio Zaidan Azzaky',
  'Mahdeya Hanum Agci',
  'Mikayla Karissa Putri',
  'Muhammad Royan Al-Kahfi',
  'Nabila hafizah',
  'Nazilla alinka Manda',
  'Qiandra Asyifa Aryani',
  'Qiara Aulia Zafira',
  'Rabiatul Adawiya',
  'Rafif Alfaridho',
  'Theona Dwi Yolanda',
  'Tsamara Ufaira Azka',
  'Usman Toha Nasution',
  'Asep Trisna Setiawan',
];

const KELAS_NAMA = '2A';
const TAHUN_AJARAN = '2025/2026';
const NISN_PREFIX = '20250'; // placeholder, bukan NISN asli

function slugify(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
}

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const kelasService = app.get(KelasService);
  const orangTuaService = app.get(OrangTuaService);
  const siswaService = app.get(SiswaService);

  const kelas = await kelasService.create({
    nama_kelas: KELAS_NAMA,
    tingkat: KELAS_NAMA.replace(/[^0-9]/g, ''),
    tahun_ajaran: TAHUN_AJARAN,
  });
  console.log(`Kelas dibuat: ${KELAS_NAMA} (${kelas._id})`);

  const mapping: Record<string, string> = {};

  for (let i = 0; i < NAMA_SISWA.length; i++) {
    const nama = NAMA_SISWA[i];
    const slug = slugify(nama);
    const nisn = `${NISN_PREFIX}${String(i + 1).padStart(3, '0')}`;

    const orangTua = await orangTuaService.create({
      nama: `Orang Tua ${nama}`,
      email: `ortu.${slug}@example.com`,
      no_hp: `0812${String(1000000 + i).padStart(7, '0')}`,
    });

    const siswa = await siswaService.create({
      nisn,
      nama,
      kelas_id: String(kelas._id),
      orang_tua_id: String(orangTua._id),
    });

    await orangTuaService.update(String(orangTua._id), {
      siswa_ids: [String(siswa._id)],
    });

    mapping[nama] = String(siswa._id);
    console.log(`  ${nama} -> student_id=${siswa._id} (nisn=${nisn})`);
  }

  const outputDir = path.join(__dirname, 'output');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'siswa-cnn-mapping.json');
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
  console.log(`\nMapping tersimpan di: ${outputPath}`);

  await app.close();
}

run().catch((error) => {
  console.error('Gagal menjalankan seed siswa CNN:', error);
  process.exit(1);
});
