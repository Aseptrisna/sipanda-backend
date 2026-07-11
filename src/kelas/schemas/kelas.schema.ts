import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type KelasDocument = HydratedDocument<Kelas>;

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Kelas {
  @Prop({ required: true, trim: true })
  nama_kelas: string;

  @Prop({ required: true, trim: true })
  tingkat: string;

  @Prop({ required: true, trim: true })
  tahun_ajaran: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Guru', default: null })
  wali_kelas_id: Types.ObjectId | null;
}

export const KelasSchema = SchemaFactory.createForClass(Kelas);
