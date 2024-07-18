import { Request, Response } from 'express';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import ResetToken from '../models/ResetToken'; // Import if using reset token model
import { sendTokenEmail } from '../services/otpService';

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { identifier } = req.body;

  try {
    let user: IUser | null = null;

    // Find user by email or phone number
    if (isValidEmail(identifier)) {
      user = await User.findOne({ email: identifier }) as IUser;
    } else if (isValidPhoneNumber(identifier)) {
      user = await User.findOne({ phoneNumber: identifier }) as IUser;
    } else {
      res.status(400).json({ message: 'Invalid identifier format.' });
      return;
    }

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Generate reset token
    const token = crypto.randomBytes(20).toString('hex');

    // Save reset token to database (if using ResetToken model)
    const resetToken = new ResetToken({
      userId: user._id,
      token: token
    });
    await resetToken.save();

    await sendTokenEmail(user.email, token);

  

    res.status(200).json({ message: 'Password Reset Link send to your mail' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Utility functions for validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+\d{1,3}\d{9,}$/;
  return phoneRegex.test(phoneNumber);
};
