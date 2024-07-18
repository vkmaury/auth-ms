import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';
import Otp, { IOtp } from '../models/Otp';

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { identifier, resetOption, otp, newPassword } = req.body;

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

    const otpRecord = await Otp.findOne({ identifier, otp });

    if (!otpRecord || otpRecord.otpExpires < new Date()) {
      res.status(400).json({ message: 'Invalid or expired OTP.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
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
