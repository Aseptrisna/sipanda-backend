import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import {
  StatusAbsensi,
  StatusVerifikasiWajah,
  SumberAbsensi,
  TipeAbsen,
} from '../../common/enums';

export type AbsensiDocument = HydratedDocument<Absensi>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Absensi {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Siswa',
    required: true,
    index: true,
  })
  siswa_id: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Kelas',
    required: true,
    index: true,
  })
  kelas_id: Types.ObjectId;

  @Prop({ required: true, index: true })
  tanggal: string;

  @Prop({ type: String, required: true, enum: TipeAbsen })
  tipe_absen: TipeAbsen;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Jadwal', default: null })
  jadwal_id: Types.ObjectId | null;

  @Prop({
    type: String,
    required: true,
    enum: StatusAbsensi,
    default: StatusAbsensi.ALPA,
  })
  status: StatusAbsensi;

  @Prop({
    type: String,
    required: true,
    enum: SumberAbsensi,
    default: SumberAbsensi.DEFAULT,
  })
  sumber: SumberAbsensi;

  @Prop({ type: Boolean, required: true, default: false })
  is_locked: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  dicatat_oleh: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  waktu_dicatat: Date | null;

  @Prop({ type: String, default: null })
  keterangan: string | null;

  @Prop({ type: Number, default: null })
  confidence_score: number | null;

  @Prop({ type: String, default: null })
  foto_capture_url: string | null;

  @Prop({ type: String, default: null, enum: StatusVerifikasiWajah })
  status_verifikasi: StatusVerifikasiWajah | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  diverifikasi_oleh: Types.ObjectId | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Izin', default: null })
  izin_id: Types.ObjectId | null;
}

export const AbsensiSchema = SchemaFactory.createForClass(Absensi);

AbsensiSchema.index(
  { siswa_id: 1, tanggal: 1, tipe_absen: 1, jadwal_id: 1 },
  { unique: true },
);
