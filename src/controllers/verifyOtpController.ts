import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Otp, { IOtp } from '../models/Otp';
import speakeasy from 'speakeasy';

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { verifyOption, identifier, otp } = req.body;

  try {
    let user: IUser | null = null;

    if (verifyOption === 'email' || verifyOption === 'newEmail') {
      if (!isValidEmail(identifier)) {
        res.status(400).json({ message: 'Invalid email format for verification.' });
        return;
      }
      if (verifyOption === 'email') {
        user = await User.findOne({ email: identifier }) as IUser;
      } else {
        user = await User.findOne({ newEmail: identifier }) as IUser;
      }
    } else if (verifyOption === 'phoneNumber' || verifyOption === 'newPhoneNumber') {
      if (!isValidPhoneNumber(identifier)) {
        res.status(400).json({ message: 'Invalid phone number format for verification.' });
        return;
      }
      if (verifyOption === 'phoneNumber') {
        user = await User.findOne({ phoneNumber: identifier }) as IUser;
      } else {
        user = await User.findOne({ newPhoneNumber: identifier }) as IUser;
      }
    } else if (verifyOption === 'Authenticator') {
      user = await User.findOne({ email: identifier }) as IUser;
    } else {
      res.status(400).json({ message: 'Invalid verification option.' });
      return;
    }

    if (!user) {
      res.status(400).json({ message: 'User not found.' });
      return;
    }

    let isValidOTP = false;

    if (verifyOption === 'email' || verifyOption === 'phoneNumber' || verifyOption === 'newEmail' || verifyOption === 'newPhoneNumber') {
      const otpRecord = await Otp.findOne({ identifier, otp }) as IOtp;

      if (!otpRecord || otpRecord.otpExpires < new Date()) {
        res.status(400).json({ message: 'Invalid or expired OTP.' });
        return;
      }
      isValidOTP = true;

      // Delete OTP after verification
      await Otp.deleteOne({ _id: otpRecord._id });
    } else if (verifyOption === 'Authenticator') {
      if (!user.googleAuthSecret) {
        res.status(400).json({ message: 'Authenticator not set up for this user.' });
        return;
      }
      isValidOTP = speakeasy.totp.verify({
        secret: user.googleAuthSecret,
        encoding: 'base32',
        token: otp,
      });
    }

    if (!isValidOTP) {
      res.status(400).json({ message: 'Invalid OTP.' });
      return;
    }

    if (verifyOption === 'newEmail' && user.newEmail) {
      user.email = user.newEmail;
      user.newEmail = undefined;
    }

    if (verifyOption === 'newPhoneNumber' && user.newPhoneNumber) {
      user.phoneNumber = user.newPhoneNumber;
      user.newPhoneNumber = undefined;
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'User verified' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const isValidEmail = (email: string): boolean => {
  // Basic email validation using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Basic phone number validation (assuming it matches a certain format)
  const phoneRegex = /^\+\d{1,3}\d{9,}$/; // Example: +1234567890
  return phoneRegex.test(phoneNumber);
};
