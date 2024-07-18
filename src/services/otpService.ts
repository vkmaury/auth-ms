import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

// Ensure environment variables are loaded
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
}

const client = twilio(accountSid, authToken);

export const generateOTP = (): string => {
  const otp = Math.random().toString().slice(2, 8); // Generate a 6-digit OTP
  return otp;
};


export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  });
};

export const sendOTPSMS = async (phoneNumber: string, otp: string): Promise<void> => {
  try {
    await client.messages.create({
      body: `Your OTP code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send OTP via SMS');
  }
};

export const sendTokenEmail = async (email: string, token: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Password Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    Please copy the token , or paste this into your postmen body to complete the process:\n\n
    http://localhost:5000/api/v1/change-Password/${token}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`
  };

  await transporter.sendMail(mailOptions);
};