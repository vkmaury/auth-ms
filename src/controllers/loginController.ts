import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { sendMessageToUserMS } from '../config1/kafka';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { loginOption, identifier, password } = req.body;

  try {
    // Validate identifier format based on loginOption
    if (loginOption === 'email') {
      if (!isValidEmail(identifier)) {
        res.status(400).json({ message: 'Invalid email format.' });
        return;
      }
    } else if (loginOption === 'phoneNumber') {
      if (!isValidPhoneNumber(identifier)) {
        res.status(400).json({ message: 'Invalid phone number format.' });
        return;
      }
    } else {
      res.status(400).json({ message: 'Invalid login option.' });
      return;
    }

    let user: IUser | null = null;

    if (loginOption === 'email') {
      user = await User.findOne({ email: identifier }) as IUser;
    } else if (loginOption === 'phoneNumber') {
      user = await User.findOne({ phoneNumber: identifier }) as IUser;
    }

    if (!user) {
      res.status(400).json({ message: 'Invalid credentials.' });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
      res.status(400).json({ message: 'Wrong password.' });
      return;
    }
    
    if (!user.isVerified) {
      res.status(400).json({ message: 'User not verified.' });
      return;
    }

    const token = jwt.sign({ userId: user._id, username: user.username, email: user.email, phoneNumber: user.phoneNumber }, process.env.JWT_SECRET!, { expiresIn: '1h' });


    const data = { userId: user._id, username: user.username, email: user.email, phoneNumber: user.phoneNumber, password: user.password }; // Example data to send
    sendMessageToUserMS('user-verification', data);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Utility functions for validation
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
