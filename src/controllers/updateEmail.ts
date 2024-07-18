import { Request, Response } from 'express';
import User from '../models/User';
import Otp, { IOtp } from '../models/Otp';
import { sendOTPEmail, generateOTP } from '../services/otpService';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
    };
  }
}

export const updateEmail = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { newEmail } = req.body;

  try {
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    // Check if the new email is already verified
    const existingUser = await User.findOne({ email: newEmail });

    if (existingUser && existingUser.isVerified) {
      res.status(400).json({ message: 'Email is already verified and in use.' });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Save OTP in the Otp collection
    const newOtp: IOtp = new Otp({ identifier: newEmail, otp, otpExpires });
    await newOtp.save();

    // Update user with newEmail and isVerified set to false
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { newEmail, isVerified: false },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Send OTP to the new email
    await sendOTPEmail(newEmail, otp);

    res.status(200).json({ message: 'Email updated successfully. Please verify your new email.' });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
