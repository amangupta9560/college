import { Router } from 'express';
import { body, query } from 'express-validator';
import { 
  getProfile, updateProfile, uploadAvatar, deleteAccount, getUserById, searchUsers 
} from '../controllers/userController.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { uploadLimiter, apiLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = Router();

// Protect all routes
router.use(verifyAccessToken);

const updateProfileValidation = [
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters.'),
  body('college').optional().trim().notEmpty().withMessage('College cannot be empty.'),
  body('year').optional().isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5.'),
  body('availability').optional().isIn(['available', 'busy', 'not_looking']).withMessage('Invalid availability status.'),
  body('githubURL').optional().trim().custom(val => !val || val.startsWith('https://') || val.startsWith('http://')).withMessage('Invalid URL format.'),
  body('linkedinURL').optional().trim().custom(val => !val || val.startsWith('https://') || val.startsWith('http://')).withMessage('Invalid URL format.'),
  body('portfolioURL').optional().trim().custom(val => !val || val.startsWith('https://') || val.startsWith('http://')).withMessage('Invalid URL format.')
];

const deleteAccountValidation = [
  body('password').notEmpty().withMessage('Password confirmation is required.')
];

const searchValidation = [
  query('q').optional().isLength({ min: 2 }).withMessage('Search query must be at least 2 characters.')
];

router.get('/me', getProfile);
router.patch('/me', apiLimiter, validate(updateProfileValidation), updateProfile);
router.post('/me/avatar', uploadLimiter, upload.single('avatar'), uploadAvatar);
router.delete('/me', validate(deleteAccountValidation), deleteAccount);

router.get('/search', validate(searchValidation), searchUsers);
router.get('/:id', getUserById);

export default router;
