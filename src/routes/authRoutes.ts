import { Router } from 'express';
import { signup } from '../controllers/signupController';
import { changeTwoFAMethod } from '../controllers/2faAuthentication';
import { verifyOTP } from '../controllers/verifyOtpController';
import { login } from '../controllers/loginController';
import { requestPasswordReset } from '../controllers/requestPasswordReset';
import { resetPassword } from '../controllers/resetPassword';
import { forgotPassword } from '../controllers/forgotPasswordController';
import { changePassword } from '../controllers/changePasswordController';
import { authenticateToken } from '../Middleware/verifyToken'; 
import { updateEmail } from '../controllers/updateEmail';
import { updatePhoneNumber } from '../controllers/updatePhone';
import { viewProfile } from '../controllers/viewProfile';
import { updateUser } from '../controllers/updateProfile';

const router = Router();

router.post('/signup', signup);
router.post('/change-2fa-method', changeTwoFAMethod);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/requestPasswordReset',requestPasswordReset)
router.post('/resetPassword',resetPassword )
router.post('/forget-Password',forgotPassword )
router.post('/change-Password/:token',changePassword )
router.put('/updateEmail', authenticateToken, updateEmail);
router.put('/updatePhone', authenticateToken, updatePhoneNumber);
router.get('/viewProfile', authenticateToken, viewProfile);
router.put('/updateUser', authenticateToken, updateUser);


export default router;
