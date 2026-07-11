import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { StatusWajah } from '../../common/enums';

export type SiswaDocument = HydratedDocument<Siswa>;

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Siswa {
  @Prop({ required: true, unique: true, trim: true })
  nisn: string;

  @Prop({ required: true, trim: true })
  nama: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Kelas',
    required: true,
    index: true,
  })
  kelas_id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'OrangTua', default: null })
  orang_tua_id: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  foto_profil_url: string | null;

  @Prop({
    type: String,
    required: true,
    enum: StatusWajah,
    default: StatusWajah.BELUM_TERDAFTAR,
  })
  status_wajah: StatusWajah;
}

export const SiswaSchema = SchemaFactory.createForClass(Siswa);
