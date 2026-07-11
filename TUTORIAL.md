# Tutorial Menjalankan SIPANDA (Untuk Pemula, Tanpa Perlu Bisa Coding)

Panduan ini dibuat supaya siapa pun — meski belum pernah coding sama sekali — bisa menjalankan sistem SIPANDA di komputernya sendiri, langkah demi langkah.

**SIPANDA terdiri dari 4 bagian** yang perlu dijalankan bersamaan:

| # | Nama | Fungsi |
|---|---|---|
| 1 | `sipanda-backend` | "Otak" sistem — mengelola semua data |
| 2 | `sipanda-face-service` | Layanan pengenalan wajah |
| 3 | `sipanda-frontend` | Tampilan web yang dibuka di browser |
| 4 | `cnn-face-recognition-research` | Riset/eksperimen model wajah (opsional, tidak wajib dijalankan sehari-hari) |

Bayangkan seperti restoran: **backend** itu dapur (mengolah semuanya), **face-service** itu koki khusus yang mengenali wajah, **frontend** itu meja makan tempat pelanggan (guru/orang tua) berinteraksi. Ketiganya harus "buka" bersamaan supaya restoran bisa jalan.

---

## Bagian 1: Instalasi Aplikasi Pendukung

Sebelum mulai, install 4 aplikasi ini di komputer (sekali saja, tidak perlu diulang):

### 1.1 Git (untuk mengunduh kode dari GitHub)
- Buka https://git-scm.com/downloads
- Unduh sesuai sistem operasi (Windows/Mac), install seperti biasa (klik Next-Next-Finish)

### 1.2 Node.js (untuk menjalankan backend & frontend)
- Buka https://nodejs.org
- Unduh versi **LTS** (yang direkomendasikan), install seperti biasa

### 1.3 Python versi 3.12 (untuk menjalankan face-service)
- Buka https://www.python.org/downloads/
- **Penting**: pilih versi **3.12.x** (bukan versi terbaru seperti 3.13/3.14 — itu belum didukung)
- Saat instalasi di Windows, **centang kotak "Add Python to PATH"** sebelum klik Install

### 1.4 MongoDB (database)
- Buka https://www.mongodb.com/try/download/community
- Unduh "MongoDB Community Server", install seperti biasa
- Setelah instalasi, pastikan MongoDB otomatis berjalan sebagai "service" (biasanya sudah otomatis di Windows/Mac — kalau ragu, restart komputer setelah instalasi)

### 1.5 (Opsional) Editor teks untuk mengedit file `.env`
- Bisa pakai Notepad (Windows) / TextEdit (Mac) bawaan, atau install [VS Code](https://code.visualstudio.com/) kalau mau lebih nyaman

---

## Bagian 2: Download Kode dari GitHub

Buka **Terminal** (Mac: aplikasi "Terminal") atau **Command Prompt/PowerShell** (Windows: cari "cmd" di Start Menu).

Pilih folder tempat menyimpan semua project (misal Desktop), lalu jalankan perintah ini satu per satu (tekan Enter setelah tiap baris):

```bash
cd Desktop
mkdir sipanda-project
cd sipanda-project

git clone https://github.com/Aseptrisna/sipanda-backend.git
git clone https://github.com/Aseptrisna/sipanda-frontend.git
git clone https://github.com/Aseptrisna/sipanda-face-service.git
git clone https://github.com/Aseptrisna/cnn-face-recognition-research.git
```

Setelah selesai, folder `sipanda-project` akan berisi 4 folder: `sipanda-backend`, `sipanda-frontend`, `sipanda-face-service`, `cnn-face-recognition-research`.

---

## Bagian 3: Setup & Jalankan Backend

Buka terminal **baru** (biarkan yang lama tetap terbuka nanti), lalu:

```bash
cd Desktop/sipanda-project/sipanda-backend
npm install
```

Perintah `npm install` akan mengunduh semua "bahan" yang dibutuhkan — **tunggu sampai selesai** (bisa 1-3 menit tergantung koneksi internet).

Selanjutnya, buat file konfigurasi:

```bash
cp .env.example .env
```

*(Kalau perintah `cp` tidak dikenali di Windows, buka folder `sipanda-backend` di File Explorer, copy-paste file `.env.example`, lalu rename hasil copy-nya jadi `.env`)*

Buka file `.env` yang baru dibuat pakai Notepad/VS Code, isi minimal:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sipanda
JWT_ACCESS_SECRET=rahasia-jwt-bebas-diisi-apa-saja
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=rahasia-refresh-bebas-diisi-apa-saja
JWT_REFRESH_EXPIRES_IN=7d
SEED_ADMIN_NAMA=Super Admin
SEED_ADMIN_EMAIL=admin@sipanda.local
SEED_ADMIN_PASSWORD=Admin12345!
FACE_SERVICE_BASE_URL=http://localhost:4001/api
FACE_SERVICE_WEBHOOK_SECRET=rahasia-webhook-bebas-diisi-apa-saja
FACE_MATCH_THRESHOLD=0.5
```

**Catatan**: nilai `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FACE_SERVICE_WEBHOOK_SECRET` boleh diisi teks acak apa saja — yang penting **jangan kosong**, dan `FACE_SERVICE_WEBHOOK_SECRET` harus **sama persis** dengan yang nanti diisi di file `.env` milik `sipanda-face-service` (Bagian 4).

Simpan file `.env`, lalu kembali ke terminal, jalankan:

```bash
npm run seed:admin
```

Ini membuat akun Super Admin pertama (email & password sesuai yang diisi di `.env` tadi).

Terakhir, jalankan backend-nya:

```bash
npm run start:dev
```

Kalau berhasil, akan muncul tulisan `Nest application successfully started`. **Biarkan terminal ini tetap terbuka** — jangan ditutup selama sistem mau dipakai.

---

## Bagian 4: Setup & Jalankan Face Service

Buka terminal **baru lagi**, lalu:

```bash
cd Desktop/sipanda-project/sipanda-face-service
```

Buat "lingkungan Python" khusus (supaya tidak bentrok dengan program lain):

**Mac/Linux:**
```bash
python3.12 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
py -3.12 -m venv venv
venv\Scripts\activate
```

Setelah aktif (biasanya muncul tulisan `(venv)` di depan baris terminal), install semua yang dibutuhkan:

```bash
pip install -r requirements.txt
```

**Ini akan makan waktu cukup lama (5-10 menit)** karena mengunduh TensorFlow (library machine learning) yang ukurannya besar. Tunggu sampai selesai.

Buat file konfigurasi:

```bash
cp .env.example .env
```

Buka file `.env` (folder `sipanda-face-service`), pastikan isinya:
```
STORAGE_ROOT=storage/dataset
MODEL_DIR=storage/model
MIN_TRAINING_PHOTOS=3
FACE_MATCH_THRESHOLD=0.5
CNN_PROJECT_DIR=../cnn-face-recognition-research
TRAIN_EPOCHS=50
TRAIN_BATCH_SIZE=8
BACKEND_WEBHOOK_URL=http://localhost:3000/face-recognition/training-complete
FACE_SERVICE_WEBHOOK_SECRET=rahasia-webhook-bebas-diisi-apa-saja
HOST=0.0.0.0
PORT=4001
```

**Penting**: 
- `FACE_SERVICE_WEBHOOK_SECRET` harus **sama persis** dengan yang diisi di `.env` backend (Bagian 3)
- `CNN_PROJECT_DIR` menunjuk ke folder `cnn-face-recognition-research` yang sudah di-download di Bagian 2 — sesuaikan path-nya kalau susunan foldermu beda

Jalankan face-service-nya:

```bash
uvicorn app.main:app --port 4001
```

Kalau berhasil, akan muncul tulisan `Uvicorn running on http://0.0.0.0:4001`. **Biarkan terminal ini juga tetap terbuka.**

---

## Bagian 5: Setup & Jalankan Frontend (Tampilan Web)

Buka terminal **baru lagi (ketiga)**, lalu:

```bash
cd Desktop/sipanda-project/sipanda-frontend
npm install
```

Buat file konfigurasi:

```bash
cp .env.example .env
```

Isi file `.env` (biasanya sudah otomatis benar, tidak perlu diubah):
```
VITE_API_BASE_URL=http://localhost:3000
```

Jalankan:

```bash
npm run dev
```

Akan muncul tulisan seperti:
```
Local:   http://localhost:5173/
```

**Biarkan terminal ini tetap terbuka juga.**

---

## Bagian 6: Buka & Gunakan SIPANDA

1. Buka browser (Chrome/Firefox/Edge)
2. Ketik alamat: `http://localhost:5173`
3. Klik **Masuk**, login pakai email & password Super Admin yang tadi diisi di Bagian 3 (`admin@sipanda.local` / `Admin12345!` kalau memakai contoh di atas)
4. Sekarang kamu sudah bisa memakai sistem: tambah data kelas, siswa, registrasi wajah, dan seterusnya.

---

## Ringkasan: Setiap Kali Mau Pakai Lagi

Setelah instalasi awal selesai (Bagian 1-5 hanya perlu sekali), untuk pemakaian selanjutnya cukup:

1. Pastikan MongoDB jalan (biasanya otomatis jalan sendiri di background)
2. Buka 3 terminal, jalankan masing-masing:
   ```bash
   # Terminal 1
   cd Desktop/sipanda-project/sipanda-backend
   npm run start:dev

   # Terminal 2 (Mac/Linux: source venv/bin/activate, Windows: venv\Scripts\activate)
   cd Desktop/sipanda-project/sipanda-face-service
   source venv/bin/activate
   uvicorn app.main:app --port 4001

   # Terminal 3
   cd Desktop/sipanda-project/sipanda-frontend
   npm run dev
   ```
3. Buka `http://localhost:5173` di browser

---

## Troubleshooting (Kalau Ada Masalah)

| Gejala | Kemungkinan Penyebab & Solusi |
|---|---|
| `command not found: npm` atau `node` | Node.js belum ke-install dengan benar. Install ulang dari nodejs.org, lalu **tutup dan buka ulang terminal**. |
| `command not found: python3.12` | Python 3.12 belum ke-install, atau nama perintahnya beda di sistemmu (coba `python3` atau `py -3.12`). |
| Error `ECONNREFUSED` / gagal connect MongoDB | MongoDB belum jalan. Buka aplikasi "MongoDB Compass" (kalau ter-install) untuk cek, atau restart komputer. |
| Halaman web putih kosong / error di browser | Cek apakah ketiga terminal (backend, face-service, frontend) semuanya masih terbuka dan tidak menunjukkan pesan error merah. |
| Login gagal "Email atau password salah" | Pastikan sudah menjalankan `npm run seed:admin` di Bagian 3, dan email/password yang diketik sama persis dengan yang diisi di `.env`. |
| `pip install` sangat lambat / gagal | Sambungan internet lambat wajar untuk TensorFlow (~500MB). Coba lagi kalau terputus di tengah jalan. |
| Fitur registrasi/absensi wajah tidak berfungsi | Pastikan terminal `sipanda-face-service` (Bagian 4) juga sedang berjalan, bukan cuma backend & frontend. |

Kalau masih ada kendala di luar tabel ini, catat pesan error yang muncul di terminal (screenshot), itu akan sangat membantu mendiagnosis masalahnya.
