# SIPANDA — Backend

Dokumentasi ini ditulis untuk **orang yang baru belajar coding**. Setiap istilah teknis akan dijelaskan dengan bahasa sederhana sebelum dipakai. Kalau kamu sudah paham NestJS/REST API, silakan lompat ke bagian yang kamu butuhkan lewat daftar isi di bawah.

## Daftar Isi

1. [Apa itu backend ini?](#1-apa-itu-backend-ini)
2. [Teknologi yang dipakai (dan kenapa)](#2-teknologi-yang-dipakai-dan-kenapa)
3. [Struktur folder](#3-struktur-folder)
4. [Konsep dasar NestJS yang dipakai di proyek ini](#4-konsep-dasar-nestjs-yang-dipakai-di-proyek-ini)
5. [Alur autentikasi (login, token, hak akses)](#5-alur-autentikasi-login-token-hak-akses)
6. [Arsitektur Absensi (bagian paling penting)](#6-arsitektur-absensi-bagian-paling-penting)
7. [Alur Pengenalan Wajah (Face Recognition)](#7-alur-pengenalan-wajah-face-recognition)
8. [Alur Perizinan (Izin/Sakit)](#8-alur-perizinan-izinsakit)
9. [Notifikasi Email](#9-notifikasi-email)
10. [Daftar lengkap API endpoint](#10-daftar-lengkap-api-endpoint)
11. [Environment variable (`.env`)](#11-environment-variable-env)
12. [Cara menjalankan](#12-cara-menjalankan)
13. [Tutorial: menambah fitur baru dari nol](#13-tutorial-menambah-fitur-baru-dari-nol)
14. [Kamus istilah](#14-kamus-istilah)

---

## 1. Apa itu backend ini?

SIPANDA (Sistem Presensi Sekolah Digital) adalah aplikasi untuk mencatat kehadiran siswa di sekolah. Folder `backend/` ini adalah **otak/server** dari aplikasi tersebut — dia yang menyimpan data ke database, memvalidasi siapa yang boleh login, menjalankan aturan bisnis ("kalau siswa izin, absensinya otomatis jadi status izin"), dan menyediakan data lewat **API** untuk dipakai oleh `frontend/` (tampilan website yang dilihat pengguna).

> **Apa itu API?** API (Application Programming Interface) di sini artinya sekumpulan "pintu" berupa alamat URL yang bisa diakses lewat internet/jaringan lokal, misalnya `GET http://localhost:3000/siswa`. Frontend "mengetuk pintu" itu untuk minta data, backend membalas dengan data dalam format JSON (teks terstruktur seperti `{"nama": "Budi"}`).

Backend ini dibangun dengan **NestJS**, sebuah framework (kerangka kerja siap pakai) untuk membuat API menggunakan bahasa **TypeScript** (JavaScript yang punya "tipe data" agar kesalahan ketik/logika lebih cepat ketahuan sebelum program dijalankan).

## 2. Teknologi yang dipakai (dan kenapa)

| Teknologi | Fungsinya | Kenapa dipakai |
|---|---|---|
| **NestJS** | Kerangka kerja server Node.js | Memaksa kode terstruktur rapi (Controller, Service, Module) — lebih gampang dirawat dibanding Express polos |
| **TypeScript** | Bahasa pemrograman (JavaScript + tipe data) | Kesalahan seperti "lupa isi field" ketahuan saat menulis kode, bukan saat aplikasi sudah jalan |
| **MongoDB** | Database (tempat data disimpan permanen) | Menyimpan data dalam bentuk dokumen mirip JSON, cocok untuk data yang strukturnya bisa berubah-ubah antar modul |
| **Mongoose** | Library penghubung NestJS ↔ MongoDB | Mendefinisikan "bentuk" data (Schema) dan memberi cara mudah untuk query database |
| **JWT (JSON Web Token)** | Sistem "tiket masuk" setelah login | Setelah login sekali, pengguna dapat "tiket" (token) yang dipakai berulang tanpa harus kirim ulang password |
| **class-validator / class-transformer** | Validasi data yang masuk dari luar | Menolak otomatis data yang tidak sesuai format sebelum masuk ke logika bisnis |
| **@nestjs/schedule** | Penjadwal tugas otomatis (cron job) | Menjalankan tugas "generate absensi harian" setiap tengah malam tanpa perlu manusia klik tombol |
| **@nestjs/axios** | Klien HTTP untuk manggil server lain | Backend ini memanggil **face-service** (server Python terpisah) untuk urusan pengenalan wajah |
| **Nodemailer (`@nestjs-modules/mailer`)** | Kirim email | Mengirim notifikasi ke orang tua saat anaknya alpa/sakit dsb |
| **exceljs** | Membuat file Excel | Fitur ekspor laporan absensi ke `.xlsx` |
| **multer** | Menerima file upload | Menyimpan foto yang diunggah (foto wajah, dsb) ke folder `uploads/` |
| **Swagger (`@nestjs/swagger`)** | Dokumentasi API otomatis & interaktif | Buka `http://localhost:3000/docs` untuk mencoba semua endpoint langsung dari browser |

## 3. Struktur folder

```
backend/src/
├── main.ts                # Titik masuk aplikasi — di sinilah server "dinyalakan"
├── app.module.ts           # Daftar semua modul yang aktif + guard global
│
├── auth/                   # Login, refresh token, logout
├── users/                  # Data akun (email, password, role) — dipakai internal oleh modul auth
│
├── kelas/                  # CRUD data kelas (2A, 9A, dst)
├── guru/                   # CRUD data guru
├── mapel/                  # CRUD data mata pelajaran
├── jadwal/                 # CRUD jadwal pelajaran per kelas
├── siswa/                  # CRUD data siswa
├── orang-tua/              # CRUD akun orang tua/wali siswa
│
├── absensi/                # Inti sistem presensi (lihat bagian 6)
├── face-recognition/       # Integrasi pengenalan wajah (lihat bagian 7)
├── izin/                   # Pengajuan & approval izin/sakit (lihat bagian 8)
├── notifikasi/             # Pengiriman email (lihat bagian 9)
├── laporan/                # Dashboard & ekspor laporan Excel
├── uploads/                # Terima file foto yang diunggah
│
├── common/                 # Kode yang dipakai bersama oleh semua modul di atas
│   ├── decorators/          # @Roles(), @Public(), @CurrentUser()
│   ├── guards/               # JwtAuthGuard, RolesGuard (penjaga akses)
│   ├── pipes/                 # ParseObjectIdPipe (validasi format ID MongoDB)
│   ├── filters/               # Penyeragam format pesan error
│   ├── enums/                  # Daftar nilai tetap (status, role, dst)
│   └── dto/                    # Bentuk data yang dipakai berulang (mis. pagination)
│
├── config/                 # Validasi variabel environment (.env)
└── database/
    └── seeds/               # Script untuk mengisi data awal (akun admin, siswa contoh)
```

**Pola tiap modul fitur** (misalnya `kelas/`) hampir selalu punya bentuk yang sama:

```
kelas/
├── kelas.module.ts     # "Daftar isi" modul: controller + service apa saja yang ada di sini
├── kelas.controller.ts # Menerima request HTTP, memanggil service, mengembalikan response
├── kelas.service.ts    # Logika bisnis + query ke database
├── schemas/
│   └── kelas.schema.ts # Bentuk data kelas di MongoDB (field apa saja yang dipunya)
└── dto/
    ├── create-kelas.dto.ts  # Bentuk data yang WAJIB dikirim saat membuat kelas baru
    └── update-kelas.dto.ts  # Bentuk data saat mengubah kelas (biasanya semua field opsional)
```

Begitu kamu paham pola di atas untuk `kelas/`, kamu otomatis paham struktur `guru/`, `mapel/`, `jadwal/`, `siswa/`, `orang-tua/` — semuanya mengikuti pola CRUD (Create, Read, Update, Delete) yang sama.

## 4. Konsep dasar NestJS yang dipakai di proyek ini

Kalau kamu baru pertama kali lihat kode NestJS, berikut istilah yang wajib kamu tahu:

- **Module** (`*.module.ts`) — "kotak" yang mengelompokkan fitur terkait. Contoh: semua yang berkaitan dengan kelas (controller, service) didaftarkan di `KelasModule`. `app.module.ts` adalah kotak besar yang mendaftarkan semua kotak modul lainnya.
- **Controller** (`*.controller.ts`) — bagian yang "mendengarkan" alamat URL (`@Get()`, `@Post()`, dst) dan menentukan apa yang terjadi kalau alamat itu diakses. Controller **tidak boleh** berisi logika rumit — dia cuma "penerima tamu" yang meneruskan ke Service.
- **Service** (`*.service.ts`) — tempat logika sebenarnya berada: query ke database, perhitungan, aturan bisnis.
- **Schema** (`schemas/*.schema.ts`) — mendefinisikan bentuk data di MongoDB memakai decorator `@Prop()`. Contoh: `nama_kelas: string` artinya setiap dokumen kelas di database punya field `nama_kelas` bertipe teks.
- **DTO — Data Transfer Object** (`dto/*.dto.ts`) — mendefinisikan bentuk data yang **boleh masuk** lewat request dari luar, lengkap dengan aturan validasi (`@IsString()`, `@IsNotEmpty()`, dst). Kalau data yang dikirim tidak sesuai DTO, NestJS otomatis menolak dengan error `400 Bad Request` sebelum kode kita sempat dijalankan.
- **Decorator** — kode yang diawali `@` (misalnya `@Controller()`, `@Get()`, `@Prop()`). Ini adalah "label/anotasi" yang menambahkan perilaku khusus ke class/method di bawahnya, ciri khas TypeScript+NestJS.
- **Guard** (`common/guards/*.guard.ts`) — kode yang dijalankan **sebelum** controller, untuk memutuskan apakah request boleh diteruskan atau ditolak. Proyek ini punya dua guard global (lihat bagian 5): `JwtAuthGuard` (cek sudah login belum) dan `RolesGuard` (cek boleh akses fitur ini atau tidak).
- **Dependency Injection (DI)** — kamu akan sering lihat pola begini di constructor:
  ```ts
  constructor(private readonly kelasService: KelasService) {}
  ```
  Artinya: "tolong sediakan `KelasService` yang siap pakai di sini." Kamu tidak perlu membuat objeknya sendiri (`new KelasService()`) — NestJS yang mengurus itu di belakang layar. Ini memudahkan testing dan membuat kode antar-bagian tidak saling terikat erat.

## 5. Alur autentikasi (login, token, hak akses)

Ada 3 peran (role) pengguna di sistem ini, didefinisikan di `common/enums/role.enum.ts`:

- `SUPER_ADMIN` — mengelola semua data master (kelas, guru, mapel, jadwal, siswa, orang tua) dan melihat dashboard sekolah secara keseluruhan.
- `WALI_KELAS` — guru yang jadi wali kelas, mencatat absensi manual, memproses izin, mengelola registrasi wajah kelasnya.
- `ORANG_TUA` — orang tua/wali siswa, hanya bisa melihat riwayat kehadiran anaknya sendiri dan mengajukan izin.

> Catatan penting: **siswa tidak punya akun login sendiri**. Yang login hanya Super Admin, Wali Kelas, dan Orang Tua.

**Langkah-langkah login (lihat `auth/auth.controller.ts` & `auth/auth.service.ts`):**

1. Frontend kirim `POST /auth/login` dengan `{ email, password }`.
2. Backend cari user berdasarkan email, lalu bandingkan password yang dikirim dengan `password_hash` yang tersimpan memakai **bcrypt** (library yang mengubah password jadi teks acak satu arah — jadi password asli tidak pernah disimpan sebagai teks biasa di database, demi keamanan).
3. Kalau cocok, backend membuat **dua token JWT**:
   - `access_token` — umur pendek (lihat `JWT_ACCESS_EXPIRES_IN` di `.env`), dipakai di header `Authorization: Bearer <token>` di **setiap** request ke endpoint yang butuh login.
   - `refresh_token` — umur panjang, disimpan di database (`auth/schemas/refresh-token.schema.ts`), dipakai **hanya** untuk minta `access_token` baru lewat `POST /auth/refresh` kalau yang lama sudah kedaluwarsa. Ini supaya pengguna tidak perlu login ulang tiap beberapa menit.
4. Setiap request yang butuh login akan melewati:
   - **`JwtAuthGuard`** — membaca token dari header, memastikan valid & belum kedaluwarsa. Kalau tidak ada/tidak valid → `401 Unauthorized`.
   - **`RolesGuard`** — mengecek decorator `@Roles(Role.SUPER_ADMIN, ...)` yang dipasang di atas method controller. Kalau role pengguna yang login tidak ada di daftar itu → `403 Forbidden`.
5. Endpoint yang **tidak butuh login** ditandai dengan decorator `@Public()` (contoh: `/auth/login` sendiri, dan webhook dari face-service).

Karena kedua guard ini didaftarkan **global** (lihat `providers: [{ provide: APP_GUARD, ... }]` di `app.module.ts`), **setiap endpoint baru yang kamu buat otomatis butuh login**, kecuali kamu sengaja tambahkan `@Public()`.

## 6. Arsitektur Absensi (bagian paling penting)

Ini bagian paling unik dari desain sistem ini, jadi dijelaskan detail.

### Satu tabel untuk semua sumber absensi

Alih-alih punya tabel terpisah untuk "absensi manual", "absensi wajah", "absensi dari izin", sistem ini memakai **satu koleksi `Absensi`** (`absensi/schemas/absensi.schema.ts`) untuk semuanya. Setiap baris mewakili **kombinasi unik**: satu siswa + satu tanggal + satu tipe absen (`masuk`, `pulang`, atau `mapel`) + satu jadwal (khusus tipe `mapel`).

Field-field pentingnya:

| Field | Fungsi |
|---|---|
| `status` | `hadir`, `sakit`, `izin`, `alpa`, atau `terlambat` |
| `sumber` | Dari mana status ini berasal: `default` (belum ada yang isi), `manual` (guru input tangan), `wajah` (dari kamera), `izin` (otomatis dari pengajuan izin yang disetujui) |
| `is_locked` | `true` kalau baris ini sudah "dikunci" oleh salah satu sumber — lihat aturan di bawah |

### Kenapa perlu "generate" tiap malam?

Setiap tengah malam (lihat `@Cron('0 0 * * *')` di `absensi.service.ts`), sistem otomatis membuat baris absensi baru untuk **semua siswa aktif** dengan status default `alpa` dan `sumber: default`, `is_locked: false`. Tugas cron ini **melewati hari Minggu** (sekolah libur).

> **Kenapa defaultnya "alpa" bukan "belum diisi"?** Supaya kalau ternyata sampai akhir hari tidak ada satupun sumber (guru, kamera, izin) yang mencatat kehadiran siswa itu, sistem otomatis menganggap dia alpa — sesuai kebiasaan pencatatan absensi di sekolah nyata, tanpa perlu ada yang "menutup" hari secara manual.

### Aturan "yang pertama menang" (first-write-wins)

Begitu satu baris absensi di-update oleh salah satu sumber (manual/wajah/izin) dan `is_locked` diset `true`, sumber lain **tidak bisa menimpanya lagi** — kecuali lewat endpoint koreksi resmi. Contoh skenario:

1. Jam 07:00, kamera mendeteksi wajah siswa A datang → status jadi `hadir`, `sumber: wajah`, `is_locked: true`.
2. Jam 07:15, wali kelas coba input manual siswa A jadi `hadir` juga → sistem melewati (skip) baris ini karena sudah terkunci, supaya data yang sudah benar tidak tertimpa data yang mungkin salah ketik.
3. Kalau ternyata ada kesalahan (misalnya kamera salah kenali orang), wali kelas/admin bisa membetulkannya lewat `PATCH /absensi/:id/koreksi` — endpoint khusus ini **boleh** menimpa baris yang terkunci, karena memang tujuannya untuk itu.

Logika ini ada di beberapa tempat di `absensi.service.ts`:
- `catatManual()` — endpoint absensi manual, melewati siswa yang `is_locked`-nya sudah `true` (lihat hasil `diabaikan` yang dikembalikan ke frontend).
- `applyFaceMatch()` — dipanggil dari modul face-recognition, cek `is_locked` sebelum menimpa.
- `applyIzin()` — dipanggil saat izin disetujui, hanya meng-update baris yang **belum** terkunci (`is_locked: false`) dalam rentang tanggal izin.
- `koreksi()` — satu-satunya jalan resmi untuk mengubah baris yang sudah terkunci, dipakai lewat `PATCH /absensi/:id/koreksi`.

### Kenapa didesain begini?

Bayangkan tanpa aturan ini: kamera mendeteksi siswa hadir jam 7 pagi, tapi jam 10 pagi orang tuanya baru mengirim surat izin sakit untuk hari itu (telat lapor) — kalau tidak ada aturan "yang pertama menang", data hadir yang sudah benar bisa tertimpa begitu saja oleh proses otomatis lain. Dengan aturan ini, hanya manusia (lewat endpoint koreksi) yang boleh mengubah keputusan yang sudah "dikunci".

## 7. Alur Pengenalan Wajah (Face Recognition)

Modul `face-recognition/` **tidak melakukan pengenalan wajah sendiri** — dia hanya menjadi jembatan (klien HTTP, lihat `face-recognition-client.service.ts`) ke server Python terpisah (folder `face-service/` di luar `backend/`, dijalankan sendiri, lihat `FACE_SERVICE_BASE_URL` di `.env`). Server Python itulah yang benar-benar menjalankan model CNN (Convolutional Neural Network, sejenis model AI untuk mengenali gambar).

Alurnya:

1. **Daftar wajah** — `POST /face-recognition/training/upload` menerima `siswa_id` + daftar URL foto (minimal 3, lihat `dto/upload-training.dto.ts`), lalu meneruskannya ke face-service dan mencatat riwayatnya di koleksi `FaceTraining`. Status siswa (`status_wajah` di data siswa) berubah jadi `menunggu_training`.
2. **Latih model** — `POST /face-recognition/training/trigger` memberitahu face-service untuk mulai melatih ulang model dengan data yang sudah terkumpul. Proses ini berjalan di latar belakang (butuh waktu), jadi endpoint ini langsung selesai tanpa menunggu training beres.
3. **Webhook selesai training** — setelah training selesai, face-service **memanggil balik** backend lewat `POST /face-recognition/training-complete` (endpoint ini dilindungi `WebhookSecretGuard`, bukan login biasa — makanya harus `FACE_SERVICE_WEBHOOK_SECRET` di kedua sisi sama persis). Backend lalu mengubah `status_wajah` siswa jadi `terdaftar` (sukses) atau `perlu_retake` (gagal).
4. **Cek status** — `GET /face-recognition/training/status/:siswaId` untuk melihat progres kapan saja.
5. **Absensi lewat wajah** — `POST /face-recognition/absensi/match` menerima foto (base64) dari kamera, backend kirim ke face-service untuk dicocokkan, lalu hasilnya diproses lewat `absensiService.applyFaceMatch()` (bagian 6) memakai `FACE_MATCH_THRESHOLD` sebagai batas minimal tingkat keyakinan (confidence) supaya dianggap "cocok".

## 8. Alur Perizinan (Izin/Sakit)

1. Orang tua mengajukan izin lewat `POST /izin` (hanya role `ORANG_TUA`), mengisi jenis (`sakit`/`izin`), tanggal mulai, dan tanggal selesai.
2. Wali kelas melihat daftar pengajuan lewat `GET /izin`, lalu memprosesnya lewat `PATCH /izin/:id/proses` (setuju/tolak).
3. Kalau **disetujui**, `izin.service.ts` memanggil `absensiService.applyIzin()` yang otomatis mengubah status semua baris absensi siswa itu dalam rentang tanggal izin (yang belum terkunci) menjadi `sakit`/`izin`, dengan `sumber: izin` dan `is_locked: true`.

## 9. Notifikasi Email

Modul `notifikasi/` mengirim email ke orang tua secara otomatis lewat `NotifikasiService`, dipanggil dari `absensi.service.ts` setiap kali status absensi siswa berubah menjadi status yang perlu diberitahukan (misalnya alpa). Dalam mode pengembangan (kalau `SMTP_HOST` di `.env` belum diisi), email **tidak benar-benar terkirim** — hanya dicatat di log terminal, supaya kamu tetap bisa lihat isi emailnya tanpa perlu setup SMTP sungguhan dulu.

## 10. Daftar lengkap API endpoint

> Semua endpoint (kecuali yang ditandai **Public**) butuh header `Authorization: Bearer <access_token>`. Untuk mencoba langsung tanpa `curl`, buka **`http://localhost:3000/docs`** (Swagger UI) setelah server berjalan — di sana kamu bisa klik "Authorize", tempel token, dan mencoba tiap endpoint interaktif dari browser.

### App / Root

| Method | Path | Role | Keterangan |
|---|---|---|---|
| GET | `/health` | Public | Cek server hidup atau tidak |

### Autentikasi (`/auth`)

| Method | Path | Role | Keterangan |
|---|---|---|---|
| POST | `/auth/login` | Public | Login, dapat `access_token` + `refresh_token` |
| POST | `/auth/refresh` | Public | Tukar refresh token dengan access token baru |
| POST | `/auth/logout` | Login (semua role) | Menonaktifkan refresh token |
| GET | `/auth/me` | Login (semua role) | Data profil pengguna yang sedang login |

### Absensi (`/absensi`)

| Method | Path | Role | Keterangan |
|---|---|---|---|
| POST | `/absensi/generate-harian` | SUPER_ADMIN | Generate manual baris absensi untuk 1 tanggal (biasanya berjalan otomatis lewat cron) |
| POST | `/absensi/manual` | SUPER_ADMIN, WALI_KELAS | Catat absensi manual sekelas sekaligus |
| GET | `/absensi` | SUPER_ADMIN, WALI_KELAS | Daftar absensi dengan filter (kelas, tanggal, dst) |
| GET | `/absensi/rekap` | SUPER_ADMIN, WALI_KELAS | Rekap ringkasan absensi per periode |
| GET | `/absensi/anak-saya` | ORANG_TUA | Riwayat absensi anak sendiri |
| GET | `/absensi/tidak-dikenali` | SUPER_ADMIN, WALI_KELAS | Daftar hasil kamera yang wajahnya tidak dikenali |
| PATCH | `/absensi/tidak-dikenali/:id/assign` | SUPER_ADMIN, WALI_KELAS | Menetapkan manual siswa mana untuk hasil "tidak dikenali" |
| GET | `/absensi/:id` | SUPER_ADMIN, WALI_KELAS | Detail satu baris absensi |
| PATCH | `/absensi/:id/koreksi` | SUPER_ADMIN, WALI_KELAS | **Membetulkan** baris absensi yang sudah tersimpan/terkunci |
| PATCH | `/absensi/:id/verifikasi-wajah` | SUPER_ADMIN, WALI_KELAS | Verifikasi manual hasil pencocokan wajah yang confidence-nya rendah |

### Pengenalan Wajah (`/face-recognition`)

| Method | Path | Role | Keterangan |
|---|---|---|---|
| POST | `/face-recognition/training/upload` | SUPER_ADMIN, WALI_KELAS | Kirim foto wajah siswa untuk didaftarkan |
| POST | `/face-recognition/training/trigger` | SUPER_ADMIN, WALI_KELAS | Mulai proses training model |
| GET | `/face-recognition/training/status/:siswaId` | SUPER_ADMIN, WALI_KELAS | Cek status training siswa tertentu |
| POST | `/face-recognition/training-complete` | Public (dilindungi secret webhook) | Dipanggil oleh face-service, bukan oleh frontend |
| DELETE | `/face-recognition/training/:siswaId` | SUPER_ADMIN | Hapus data wajah terdaftar siswa |
| POST | `/face-recognition/absensi/match` | SUPER_ADMIN, WALI_KELAS | Cocokkan foto kamera dengan siswa terdaftar untuk absensi |

### Kelas (`/kelas`), Guru (`/guru`), Mapel (`/mapel`), Jadwal (`/jadwal`), Siswa (`/siswa`), Orang Tua (`/orang-tua`)

Keenam modul data master ini mengikuti pola CRUD yang **identik**:

| Method | Path | Role | Keterangan |
|---|---|---|---|
| POST | `/<resource>` | SUPER_ADMIN | Buat data baru |
| GET | `/<resource>` | SUPER_ADMIN, WALI_KELAS | Daftar semua data (dengan pagination) |
| GET | `/<resource>/:id` | SUPER_ADMIN, WALI_KELAS | Detail satu data |
| PATCH | `/<resource>/:id` | SUPER_ADMIN | Ubah data |
| DELETE | `/<resource>/:id` | SUPER_ADMIN | Hapus data |

Ganti `<resource>` dengan `kelas`, `guru`, `mapel`, `jadwal`, `siswa`, atau `orang-tua`. Tambahan khusus:

| Method | Path | Role | Keterangan |
|---|---|---|---|
| GET | `/siswa/anak-saya` | ORANG_TUA | Data siswa yang jadi anak dari orang tua yang login |

### Izin (`/izin`)

| Method | Path | Role | Keterangan |
|---|---|---|---|
| POST | `/izin` | ORANG_TUA | Ajukan izin/sakit untuk anak sendiri |
| GET | `/izin` | SUPER_ADMIN, WALI_KELAS, ORANG_TUA | Daftar pengajuan izin (otomatis dibatasi sesuai role) |
| GET | `/izin/:id` | SUPER_ADMIN, WALI_KELAS | Detail satu pengajuan |
| PATCH | `/izin/:id/proses` | WALI_KELAS | Setujui/tolak pengajuan izin |

### Laporan (`/laporan`)

| Method | Path | Role | Keterangan |
|---|---|---|---|
| GET | `/laporan/dashboard-admin` | SUPER_ADMIN | Data ringkasan untuk dashboard Super Admin |
| GET | `/laporan/dashboard-wali-kelas` | SUPER_ADMIN, WALI_KELAS | Data ringkasan untuk dashboard Wali Kelas |
| GET | `/laporan/export` | SUPER_ADMIN, WALI_KELAS | Unduh laporan absensi dalam format Excel (`.xlsx`) |

### Unggah Berkas (`/uploads`)

| Method | Path | Role | Keterangan |
|---|---|---|---|
| POST | `/uploads/photos` | Login (semua role) | Unggah hingga 20 foto (jpeg/png/webp, maks 10MB masing-masing), balikan berupa daftar URL publik |

## 11. Environment variable (`.env`)

Salin `.env.example` menjadi `.env`, lalu isi:

| Variabel | Contoh | Fungsi |
|---|---|---|
| `PORT` | `3000` | Port server backend berjalan |
| `MONGODB_URI` | `mongodb://localhost:27017/sipanda` | Alamat database MongoDB |
| `JWT_ACCESS_SECRET` | teks acak panjang | Kunci rahasia untuk menandatangani access token — **jangan bocorkan/commit ke git** |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Umur access token |
| `JWT_REFRESH_SECRET` | teks acak panjang | Kunci rahasia untuk refresh token (harus beda dari access secret) |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Umur refresh token |
| `SEED_ADMIN_NAMA` / `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | — | Dipakai sekali oleh `npm run seed:admin` untuk membuat akun Super Admin pertama |
| `FACE_SERVICE_BASE_URL` | `http://localhost:4001` | Alamat server Python face-service (**tanpa** akhiran `/api`) |
| `FACE_SERVICE_WEBHOOK_SECRET` | teks acak | Harus **identik** dengan nilai di `.env` milik face-service, dipakai memverifikasi webhook `training-complete` |
| `FACE_MATCH_THRESHOLD` | `0.5` | Batas minimal tingkat keyakinan (0–1) agar hasil pencocokan wajah dianggap valid |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | — | Konfigurasi server email. Kosongkan `SMTP_HOST` saat development — email akan disimulasikan lewat log saja |

Semua variabel ini divalidasi saat aplikasi start lewat `config/env.validation.ts` — kalau ada yang wajib tapi kosong/salah format, server akan menolak untuk menyala dan menampilkan pesan error yang jelas.

## 12. Cara menjalankan

Panduan lengkap (termasuk menyalakan face-service Python dan seed data) ada di **`../CARA_MENJALANKAN.md`** di folder root proyek. Ringkasnya, khusus untuk backend saja:

```bash
cd backend
npm install                 # sekali saja, install semua library
cp .env.example .env        # lalu isi sesuai bagian 11 di atas
npm run seed:admin          # sekali saja, membuat akun Super Admin pertama
npm run start:dev           # menjalankan server, otomatis restart tiap ada perubahan kode
```

Setelah berjalan, coba buka:
- `http://localhost:3000/health` → harus muncul teks status server hidup
- `http://localhost:3000/docs` → dokumentasi API interaktif (Swagger)

**Perintah lain yang berguna:**

```bash
npm run lint       # cek gaya penulisan kode otomatis (dan perbaiki yang bisa diperbaiki otomatis)
npm run test       # jalankan unit test
npm run build      # kompilasi TypeScript → JavaScript ke folder dist/ (untuk produksi)
```

## 13. Tutorial: menambah fitur baru dari nol

Misalnya kamu ingin menambah fitur CRUD baru bernama **"Ekstrakurikuler"**. Berikut langkah lengkapnya, mengikuti pola yang sudah ada di modul `mapel/` (modul paling sederhana untuk dicontoh):

1. **Buat folder & schema** — `src/ekstrakurikuler/schemas/ekstrakurikuler.schema.ts`:
   ```ts
   import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
   import { HydratedDocument } from 'mongoose';

   export type EkstrakurikulerDocument = HydratedDocument<Ekstrakurikuler>;

   @Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
   export class Ekstrakurikuler {
     @Prop({ required: true })
     nama: string;
   }

   export const EkstrakurikulerSchema = SchemaFactory.createForClass(Ekstrakurikuler);
   ```

2. **Buat DTO** — `src/ekstrakurikuler/dto/create-ekstrakurikuler.dto.ts`:
   ```ts
   import { IsNotEmpty, IsString } from 'class-validator';

   export class CreateEkstrakurikulerDto {
     @IsString()
     @IsNotEmpty()
     nama: string;
   }
   ```
   Dan `update-ekstrakurikuler.dto.ts` — biasanya cukup:
   ```ts
   import { PartialType } from '@nestjs/swagger';
   import { CreateEkstrakurikulerDto } from './create-ekstrakurikuler.dto';

   export class UpdateEkstrakurikulerDto extends PartialType(CreateEkstrakurikulerDto) {}
   ```
   (`PartialType` otomatis membuat semua field jadi opsional, cocok untuk update sebagian data.)

3. **Buat Service** — `src/ekstrakurikuler/ekstrakurikuler.service.ts` (contoh minim, lihat `mapel.service.ts` untuk versi lengkap dengan pagination):
   ```ts
   import { Injectable, NotFoundException } from '@nestjs/common';
   import { InjectModel } from '@nestjs/mongoose';
   import { Model } from 'mongoose';
   import { Ekstrakurikuler, EkstrakurikulerDocument } from './schemas/ekstrakurikuler.schema';
   import { CreateEkstrakurikulerDto } from './dto/create-ekstrakurikuler.dto';

   @Injectable()
   export class EkstrakurikulerService {
     constructor(
       @InjectModel(Ekstrakurikuler.name)
       private readonly model: Model<EkstrakurikulerDocument>,
     ) {}

     create(dto: CreateEkstrakurikulerDto) {
       return this.model.create(dto);
     }

     findAll() {
       return this.model.find().exec();
     }
   }
   ```

4. **Buat Controller** — `src/ekstrakurikuler/ekstrakurikuler.controller.ts`:
   ```ts
   import { Body, Controller, Get, Post } from '@nestjs/common';
   import { Roles } from '../common/decorators/roles.decorator';
   import { Role } from '../common/enums/role.enum';
   import { EkstrakurikulerService } from './ekstrakurikuler.service';
   import { CreateEkstrakurikulerDto } from './dto/create-ekstrakurikuler.dto';

   @Controller('ekstrakurikuler')
   export class EkstrakurikulerController {
     constructor(private readonly service: EkstrakurikulerService) {}

     @Post()
     @Roles(Role.SUPER_ADMIN)
     create(@Body() dto: CreateEkstrakurikulerDto) {
       return this.service.create(dto);
     }

     @Get()
     @Roles(Role.SUPER_ADMIN, Role.WALI_KELAS)
     findAll() {
       return this.service.findAll();
     }
   }
   ```

5. **Buat Module** — `src/ekstrakurikuler/ekstrakurikuler.module.ts`:
   ```ts
   import { Module } from '@nestjs/common';
   import { MongooseModule } from '@nestjs/mongoose';
   import { EkstrakurikulerController } from './ekstrakurikuler.controller';
   import { EkstrakurikulerService } from './ekstrakurikuler.service';
   import { Ekstrakurikuler, EkstrakurikulerSchema } from './schemas/ekstrakurikuler.schema';

   @Module({
     imports: [
       MongooseModule.forFeature([
         { name: Ekstrakurikuler.name, schema: EkstrakurikulerSchema },
       ]),
     ],
     controllers: [EkstrakurikulerController],
     providers: [EkstrakurikulerService],
   })
   export class EkstrakurikulerModule {}
   ```

6. **Daftarkan ke `app.module.ts`** — tambahkan import dan masukkan `EkstrakurikulerModule` ke array `imports: [...]`. **Ini langkah yang paling sering lupa dilakukan** — kalau lupa, modul kamu tidak akan pernah terpanggil sama sekali walau kodenya benar.

7. **Jalankan & tes** — `npm run start:dev`, lalu buka `http://localhost:3000/docs`, cari endpoint `/ekstrakurikuler` di Swagger, dan coba langsung dari sana.

## 14. Kamus istilah

- **REST API** — cara berkomunikasi antar aplikasi lewat HTTP, memakai kombinasi alamat URL + method (`GET` untuk ambil data, `POST` untuk buat baru, `PATCH` untuk ubah sebagian, `DELETE` untuk hapus).
- **JSON** — format teks untuk menukar data, mirip objek JavaScript: `{"nama": "Budi", "umur": 10}`.
- **Endpoint** — satu alamat + method HTTP tertentu yang bisa diakses, misalnya `GET /siswa`.
- **CRUD** — singkatan Create, Read, Update, Delete — empat operasi dasar yang hampir selalu ada di fitur pengelolaan data.
- **Middleware/Guard** — kode yang "menyaring" request sebelum sampai ke tujuan akhir (controller).
- **Environment variable** — nilai konfigurasi (alamat database, kunci rahasia, dst) yang disimpan di luar kode, biasanya di file `.env`, supaya tidak perlu ubah kode kalau pindah server atau ganti kredensial.
- **Hash (password hash)** — hasil "acakan satu arah" dari sebuah teks; tidak bisa dikembalikan ke teks asli. Dipakai supaya walau database bocor, password asli pengguna tetap tidak diketahui.
- **Token (JWT)** — teks terenkripsi yang membuktikan "saya sudah login sebagai user X dengan role Y", tanpa perlu backend menyimpan status login di memori server.
- **Cron job** — tugas terjadwal yang berjalan otomatis di waktu tertentu (mis. tiap tengah malam), tanpa perlu dipicu manusia.
- **Webhook** — kebalikan dari API biasa: alih-alih kita yang minta data ke server lain, server lain itu yang **memanggil balik** alamat kita saat suatu peristiwa terjadi (di proyek ini: face-service memanggil balik backend saat training model selesai).
