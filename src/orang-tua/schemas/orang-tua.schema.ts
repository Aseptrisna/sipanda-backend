import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type OrangTuaDocument = HydratedDocument<OrangTua>;

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'orang_tua',
})
export class OrangTua {
  @Prop({ required: true, trim: true })
  nama: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  no_hp: string;

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Siswa', default: [] })
  siswa_ids: Types.ObjectId[];
}

export const OrangTuaSchema = SchemaFactory.createForClass(OrangTua);
