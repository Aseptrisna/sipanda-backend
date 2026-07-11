import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TipeAbsen } from '../../common/enums';

export type AbsensiTidakDikenaliDocument =
  HydratedDocument<AbsensiTidakDikenali>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class AbsensiTidakDikenali {
  @Prop({ required: true, index: true })
  tanggal: string;

  @Prop({ required: true })
  waktu: Date;

  @Prop({ type: String, required: true, enum: TipeAbsen })
  tipe_absen: TipeAbsen;

  @Prop({ required: true })
  confidence_score: number;

  @Prop({ required: true })
  foto_capture_url: string;

  @Prop({ type: Boolean, required: true, default: false })
  sudah_ditugaskan: boolean;
}

export const AbsensiTidakDikenaliSchema =
  SchemaFactory.createForClass(AbsensiTidakDikenali);
