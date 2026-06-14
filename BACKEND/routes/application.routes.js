import { Router } from 'express';
import { body } from 'express-validator';
import { 
  applyToTeam, listApplications, withdrawApplication, acceptApplication, rejectApplication 
} from '../controllers/applicationController.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(verifyAccessToken);

const applyValidation = [
  body('teamId').isMongoId().withMessage('Invalid Team ID format.'),
  body('role').trim().notEmpty().withMessage('Target role is required.'),
  body('coverMessage').optional().isLength({ max: 500 }).withMessage('Cover message cannot exceed 500 characters.')
];

const rejectValidation = [
  body('message').optional().isLength({ max: 300 }).withMessage('Rejection message cannot exceed 300 characters.')
];

router.post('/', apiLimiter, validate(applyValidation), applyToTeam);
router.get('/', listApplications);
router.patch('/:id/withdraw', withdrawApplication);
router.patch('/:id/accept', acceptApplication);
router.patch('/:id/reject', validate(rejectValidation), rejectApplication);

export default router;
