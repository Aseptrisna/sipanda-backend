import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type MapelDocument = HydratedDocument<Mapel>;

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Mapel {
  @Prop({ required: true, trim: true })
  nama_mapel: string;

  @Prop({ required: true, unique: true, trim: true })
  kode_mapel: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Guru', default: null })
  guru_id: Types.ObjectId | null;
}

export const MapelSchema = SchemaFactory.createForClass(Mapel);
