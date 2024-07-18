import { Schema, model, Document } from 'mongoose';

export interface IOtp extends Document {
  identifier: string;
  otp: string;
  otpExpires: Date;
  googleAuthSecret?: string; 
}

const OtpSchema = new Schema<IOtp>({
  identifier: { type: String, required: true },
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true },
  googleAuthSecret: { type: String },
});

export default model<IOtp>('Otp', OtpSchema);
