import { Router } from 'express';
import { body } from 'express-validator';
import { 
  createReview, getUserReviews, updateReview, deleteReview 
} from '../controllers/reviewController.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(verifyAccessToken);

const reviewValidation = [
  body('revieweeId').trim().notEmpty().withMessage('Reviewee ID is required.'),
  body('teamId').trim().notEmpty().withMessage('Team ID is required.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.')
];

router.post('/', validate(reviewValidation), createReview);
router.get('/user/:userId', getUserReviews);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;
