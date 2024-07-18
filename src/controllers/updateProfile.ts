// src/controllers/userController.ts

import { Request, Response } from 'express';
import User, { IUser } from '../models/User';



export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId; // Extract userId from the verified token payload
  const { dob, address, firstName, lastName, username } = req.body;

  try {
    if (!userId) {
      res.status(400).json({ message: 'Invalid token: User ID not found' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update user fields
    if (dob) user.dob = dob;
    if (address) user.address = address;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (username) user.username = username;

    // Save updated user data
    await user.save();

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
