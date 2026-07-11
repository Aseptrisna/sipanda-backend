export enum StatusGuru {
  AKTIF = 'aktif',
  NONAKTIF = 'nonaktif',
}

export enum StatusWajah {
  BELUM_TERDAFTAR = 'belum_terdaftar',
  MENUNGGU_TRAINING = 'menunggu_training',
  TERDAFTAR = 'terdaftar',
  PERLU_RETAKE = 'perlu_retake',
}

export enum HariSekolah {
  SENIN = 'senin',
  SELASA = 'selasa',
  RABU = 'rabu',
  KAMIS = 'kamis',
  JUMAT = 'jumat',
  SABTU = 'sabtu',
}

export enum TipeAbsen {
  MASUK = 'masuk',
  PULANG = 'pulang',
  MAPEL = 'mapel',
}

export enum StatusAbsensi {
  HADIR = 'hadir',
  SAKIT = 'sakit',
  IZIN = 'izin',
  ALPA = 'alpa',
  TERLAMBAT = 'terlambat',
}

export enum StatusFaceTraining {
  PENDING = 'pending',
  PROCESSING = 'processing',
  TRAINED = 'trained',
  FAILED = 'failed',
}

export enum StatusVerifikasiWajah {
  TERVERIFIKASI_OTOMATIS = 'terverifikasi_otomatis',
  MENUNGGU_VERIFIKASI = 'menunggu_verifikasi',
  TERVERIFIKASI_MANUAL = 'terverifikasi_manual',
  DITOLAK = 'ditolak',
}

export enum SumberAbsensi {
  DEFAULT = 'default',
  MANUAL = 'manual',
  WAJAH = 'wajah',
  IZIN = 'izin',
}

export enum StatusIzin {
  MENUNGGU = 'menunggu',
  DISETUJUI = 'disetujui',
  DITOLAK = 'ditolak',
}
