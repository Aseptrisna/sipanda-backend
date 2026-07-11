import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { StatusAbsensi, StatusIzin } from '../../common/enums';

export type IzinDocument = HydratedDocument<Izin>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Izin {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Siswa',
    required: true,
    index: true,
  })
  siswa_id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  diajukan_oleh: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: [StatusAbsensi.SAKIT, StatusAbsensi.IZIN],
  })
  jenis: StatusAbsensi.SAKIT | StatusAbsensi.IZIN;

  @Prop({ required: true, index: true })
  tanggal_mulai: string;

  @Prop({ required: true })
  tanggal_selesai: string;

  @Prop({ type: String, default: null })
  lampiran_url: string | null;

  @Prop({
    type: String,
    required: true,
    enum: StatusIzin,
    default: StatusIzin.MENUNGGU,
  })
  status: StatusIzin;

  @Prop({ type: String, default: null })
  catatan: string | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  diproses_oleh: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  diproses_pada: Date | null;
}

export const IzinSchema = SchemaFactory.createForClass(Izin);
