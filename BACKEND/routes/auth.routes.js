import { Router } from 'express';
import { body } from 'express-validator';
import { 
  register, verifyOTP, login, logout, refresh, 
  forgotPassword, verifyResetOTP, resetPassword 
} from '../controllers/authController.js';
import { verifyAccessToken, verifyRefreshToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

const registerValidation = [
  body('email').isEmail().withMessage('Provide a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.'),
  body('college').trim().notEmpty().withMessage('College name is required.'),
  body('degree').trim().notEmpty().withMessage('Degree is required.'),
  body('branch').trim().notEmpty().withMessage('Branch is required.'),
  body('year').isInt({ min: 1, max: 5 }).withMessage('Year must be a number between 1 and 5.')
];

const verifyOtpValidation = [
  body('email').isEmail().withMessage('Provide a valid email address.').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits.')
];

const loginValidation = [
  body('email').isEmail().withMessage('Provide a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Provide a valid email address.').normalizeEmail()
];

const resetPasswordValidation = [
  body('resetToken').notEmpty().withMessage('Reset token is required.'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
];

router.post('/register', authLimiter, validate(registerValidation), register);
router.post('/verify-otp', authLimiter, validate(verifyOtpValidation), verifyOTP);
router.post('/login', authLimiter, validate(loginValidation), login);
router.post('/logout', verifyAccessToken, logout);
router.post('/refresh', verifyRefreshToken, refresh);

router.post('/forgot-password', authLimiter, validate(forgotPasswordValidation), forgotPassword);
router.post('/verify-reset-otp', authLimiter, validate(verifyOtpValidation), verifyResetOTP);
router.post('/reset-password', authLimiter, validate(resetPasswordValidation), resetPassword);

export default router;
