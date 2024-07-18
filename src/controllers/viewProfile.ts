// src/controllers/userController.ts

import { Request, Response } from 'express';
import User, { IUser } from '../models/User'; // Import your User model
// import { consumer } from '../config1/kafka-consume';

// Custom.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload & { userId?: string };
  }
}

export const viewProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId; // Extract userId from the verified token payload

  try {
    if (!userId) {
      res.status(400).json({ message: 'Invalid token: User ID not found' });
      return;
    }

    const user = await User.findById(userId) as IUser | null; // Query user profile from database
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Customize the profile response based on your User model structure
    const userProfile = {
      id: user._id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      address: user.address,
      firstName: user.firstName,
      lastName: user.lastName
      // Add other profile fields as needed
    };

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
