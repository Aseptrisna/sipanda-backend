import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class RefreshToken {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  })
  user_id: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  jti: string;

  @Prop({ required: true })
  token_hash: string;

  @Prop({ required: true })
  expires_at: Date;

  @Prop({ default: false })
  revoked: boolean;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
