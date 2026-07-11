import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { StatusAbsensi, StatusIzin } from '../common/enums';

@Injectable()
export class NotifikasiService {
  private readonly logger = new Logger(NotifikasiService.name);
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    this.fromAddress =
      this.configService.get<string>('SMTP_FROM') ?? 'noreply@sipanda.local';

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.configService.get<string>('SMTP_PORT') ?? '587'),
        secure: this.configService.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
      this.logger.warn(
        'SMTP_HOST tidak diset — email tidak benar-benar dikirim, hanya dicatat di log (mode dev)',
      );
    }
  }

  private async kirim(to: string, subject: string, html: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- nodemailer's Transporter.sendMail return type varies by transport implementation
      const result = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
      });
      const info = result as { messageId?: string };
      this.logger.log(
        `Email terkirim ke ${to}: ${subject} (${info.messageId ?? 'dev-mode'})`,
      );
    } catch (error) {
      this.logger.error(
        `Gagal mengirim email ke ${to}: ${(error as Error).message}`,
      );
    }
  }

  async kirimNotifikasiKetidakhadiran(
    email: string,
    namaSiswa: string,
    tanggal: string,
    status: StatusAbsensi,
  ) {
    const labelStatus: Record<string, string> = {
      [StatusAbsensi.ALPA]: 'Alpa (tidak hadir tanpa keterangan)',
      [StatusAbsensi.SAKIT]: 'Sakit',
      [StatusAbsensi.IZIN]: 'Izin',
    };

    await this.kirim(
      email,
      `[SIPANDA] Info Kehadiran ${namaSiswa} — ${tanggal}`,
      `<p>Yth. Orang Tua/Wali,</p>
       <p>Kami informasikan bahwa ananda <strong>${namaSiswa}</strong> pada tanggal <strong>${tanggal}</strong> tercatat dengan status:</p>
       <p style="font-size:16px"><strong>${labelStatus[status] ?? status}</strong></p>
       <p>Jika ada pertanyaan, silakan hubungi wali kelas.</p>
       <p>Salam,<br/>SIPANDA</p>`,
    );
  }

  async kirimNotifikasiIzinDiproses(
    email: string,
    namaSiswa: string,
    tanggalMulai: string,
    tanggalSelesai: string,
    status: StatusIzin,
    catatan?: string | null,
  ) {
    const label = status === StatusIzin.DISETUJUI ? 'DISETUJUI' : 'DITOLAK';

    await this.kirim(
      email,
      `[SIPANDA] Pengajuan Izin ${namaSiswa} — ${label}`,
      `<p>Yth. Orang Tua/Wali,</p>
       <p>Pengajuan izin untuk ananda <strong>${namaSiswa}</strong> pada tanggal <strong>${tanggalMulai}</strong> s/d <strong>${tanggalSelesai}</strong> telah <strong>${label}</strong> oleh wali kelas.</p>
       ${catatan ? `<p>Catatan: ${catatan}</p>` : ''}
       <p>Salam,<br/>SIPANDA</p>`,
    );
  }
}
