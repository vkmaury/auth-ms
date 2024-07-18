import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  otp: any;
  otpExpires: any;
  googleAuthSecret: any;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  isVerified: boolean;
  newEmail?: string;
  newPhoneNumber?:string;
  dob:Date;
  address: string;
  firstName:string;
  lastName:string;
  _id: Schema.Types.ObjectId;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
 
  newEmail: { type: String },
  newPhoneNumber: { type: String },
  dob: { type: Date, required: false },
  address: { type: String, required: false },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
});

export default model<IUser>('Microservices', userSchema);
