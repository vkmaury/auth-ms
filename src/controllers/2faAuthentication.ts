import { Request, Response } from 'express';
import User from '../models/User';
import Otp, { IOtp } from '../models/Otp';
import { generateOTP, sendOTPEmail, sendOTPSMS } from '../services/otpService';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const changeTwoFAMethod = async (req: Request, res: Response): Promise<void> => {
  const { userId, new2FAMethod, email, phoneNumber } = req.body;

  try {
    if (!userId || !new2FAMethod || !(email || phoneNumber)) {
      res.status(400).json({ message: 'User ID, new 2FA method, and either email or phone number are required.' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (new2FAMethod === 'email') {
      if (!email) {
        res.status(400).json({ message: 'Email is required for email 2FA.' });
        return;
      }
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      // Save OTP in the Otp collection
      const newOtp: IOtp = new Otp({ identifier: email, otp, otpExpires });
      await newOtp.save();

      await sendOTPEmail(email, otp);
    } else if (new2FAMethod === 'phoneNumber') {
      if (!phoneNumber) {
        res.status(400).json({ message: 'Phone number is required for SMS 2FA.' });
        return;
      }
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      // Save OTP in the Otp collection
      const newOtp: IOtp = new Otp({ identifier: phoneNumber, otp, otpExpires });
      await newOtp.save();

      await sendOTPSMS(phoneNumber, otp);
    } else if (new2FAMethod === 'Authenticator') {
      const secret = speakeasy.generateSecret({ length: 20 });
      user.googleAuthSecret = secret.base32;

      const otpAuthUrl = speakeasy.otpauthURL({ secret: secret.ascii, label: user.email, issuer: 'YourAppName' });

      QRCode.toDataURL(otpAuthUrl, (err, dataUrl) => {
        if (err) {
          console.error('QR code generation error:', err);
          res.status(500).json({ message: 'Internal server error' });
          return;
        }
        res.status(200).json({ message: '2FA method changed. Please scan the QR code with your Authenticator app.', qrCodeUrl: dataUrl });
      });
      return;
    } else {
      res.status(400).json({ message: 'Invalid 2FA method. Please choose either "email", "phoneNumber", or "Authenticator".' });
      return;
    }

    await user.save();

    res.status(200).json({ message: '2FA method changed successfully. Please verify the new OTP sent to email or SMS.' });
  } catch (error) {
    console.error('Change 2FA method error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

