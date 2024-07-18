import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, email, phoneNumber, password, dob, name, address } = req.body;

  try {
    // Validate required fields
    if (!username || !password || !(email || phoneNumber) || !dob || !name || !address) {
      res.status(400).json({ message: 'Username, password, either email or phone number, date of birth, name, and address are required.' });
      return;
    }

    // Check if the user already exists
    let existingUser: IUser | null = null;
    if (email) {
      existingUser = await User.findOne({ email });
    }
    if (!existingUser && phoneNumber) {
      existingUser = await User.findOne({ phoneNumber });
    }

    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email or phone number.' });
      return;
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, phoneNumber, password: hashedPassword, dob, name, address });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: 'User created successfully. verify 2FA Authenication  ' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
