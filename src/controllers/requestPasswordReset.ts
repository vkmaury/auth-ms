import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Otp, { IOtp } from '../models/Otp';
import { generateOTP, sendOTPEmail, sendOTPSMS } from '../services/otpService';

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  const { identifier, resetOption } = req.body;

  try {
    let user: IUser | null = null;

    if (resetOption === 'email') {
      if (!isValidEmail(identifier)) {
        res.status(400).json({ message: 'Invalid email format.' });
        return;
      }
      user = await User.findOne({ email: identifier }) as IUser;
    } else if (resetOption === 'phoneNumber') {
      if (!isValidPhoneNumber(identifier)) {
        res.status(400).json({ message: 'Invalid phone number format.' });
        return;
      }
      user = await User.findOne({ phoneNumber: identifier }) as IUser;
    } else {
      res.status(400).json({ message: 'Invalid reset option.' });
      return;
    }

    if (!user) {
      res.status(400).json({ message: 'User not found.' });
      return;
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Save OTP in the Otp collection
    const newOtp: IOtp = new Otp({ identifier, otp, otpExpires });
    await newOtp.save();

    // Send OTP via email or SMS
    if (resetOption === 'email') {
      await sendOTPEmail(identifier, otp);
    } else if (resetOption === 'phoneNumber') {
      await sendOTPSMS(identifier, otp);
    }

    res.status(200).json({ message: 'OTP sent for password reset.' });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+\d{1,3}\d{9,}$/;
  return phoneRegex.test(phoneNumber);
};
