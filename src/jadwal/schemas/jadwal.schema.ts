import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { HariSekolah } from '../../common/enums';

export type JadwalDocument = HydratedDocument<Jadwal>;

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Jadwal {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Kelas',
    required: true,
    index: true,
  })
  kelas_id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Mapel', required: true })
  mapel_id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Guru', required: true })
  guru_id: Types.ObjectId;

  @Prop({ type: String, required: true, enum: HariSekolah })
  hari: HariSekolah;

  @Prop({ required: true })
  jam_mulai: string;

  @Prop({ required: true })
  jam_selesai: string;
}

export const JadwalSchema = SchemaFactory.createForClass(Jadwal);
