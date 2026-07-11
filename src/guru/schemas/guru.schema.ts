import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { StatusGuru } from '../../common/enums';

export type GuruDocument = HydratedDocument<Guru>;

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Guru {
  @Prop({ required: true, trim: true })
  nama: string;

  @Prop({ required: true, unique: true, trim: true })
  nip: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Mapel', default: [] })
  mapel_ids: Types.ObjectId[];

  @Prop({
    type: String,
    required: true,
    enum: StatusGuru,
    default: StatusGuru.AKTIF,
  })
  status: StatusGuru;

  @Prop({ default: false })
  is_wali_kelas: boolean;
}

export const GuruSchema = SchemaFactory.createForClass(Guru);
