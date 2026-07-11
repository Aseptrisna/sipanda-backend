import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { StatusFaceTraining } from '../../common/enums';

export type FaceTrainingDocument = HydratedDocument<FaceTraining>;

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class FaceTraining {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Siswa',
    required: true,
    index: true,
  })
  siswa_id: Types.ObjectId;

  @Prop({ type: [String], required: true })
  foto_urls: string[];

  @Prop({ required: true })
  versi: number;

  @Prop({ type: String, required: true, enum: StatusFaceTraining })
  status: StatusFaceTraining;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  requested_by: Types.ObjectId;

  @Prop({ type: String, default: null })
  model_version: string | null;

  @Prop({ type: String, default: null })
  error_message: string | null;

  @Prop({ type: Date, default: null })
  completed_at: Date | null;
}

export const FaceTrainingSchema = SchemaFactory.createForClass(FaceTraining);
