import { Request, Response } from 'express';
import User from '../models/User';
import { sendOTPSMS, generateOTP } from '../services/otpService';

export const updatePhoneNumber = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { newPhoneNumber } = req.body;

  try {
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    // Check if the new phone number is already verified
    const existingUser = await User.findOne({ phoneNumber: newPhoneNumber });

    if (existingUser && existingUser.isVerified) {
      res.status(400).json({ message: 'Phone number is already verified and in use.' });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Update user with newPhoneNumber, OTP, and isVerified set to false
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { newPhoneNumber, otp, otpExpires, isVerified: false },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Send OTP to the new phone number
    await sendOTPSMS(newPhoneNumber, otp);

    res.status(200).json({ message: 'Phone number updated successfully. Please verify your new phone number.' });
  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
