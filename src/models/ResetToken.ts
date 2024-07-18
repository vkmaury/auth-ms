import mongoose, { Schema, Document } from 'mongoose';

export interface IResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
}

const ResetTokenSchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // Expires in 1 hour
});

export default mongoose.model<IResetToken>('ResetToken', ResetTokenSchema);
