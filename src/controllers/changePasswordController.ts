import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import ResetToken from '../models/ResetToken';
import User, { IUser } from '../models/User';

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { newPassword } = req.body;
  const { token } = req.params; // Extract token from request parameters

  try {
    // Find reset token
    const resetToken = await ResetToken.findOne({ token });

    if (!resetToken) {
      res.status(400).json({ message: 'Invalid or expired reset token.' });
      return;
    }

    // Find user by reset token
    const user = await User.findById(resetToken.userId) as IUser;

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Update user password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete reset token (optional)
    await resetToken.deleteOne();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
