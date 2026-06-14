import { Router } from 'express';
import { body } from 'express-validator';
import { 
  createHackathon, getHackathons, getHackathonById, updateHackathon, deleteHackathon, 
  registerTeamToHackathon, uploadBanner 
} from '../controllers/hackathonController.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { uploadLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Public routes
router.get('/', getHackathons);
router.get('/:id', getHackathonById);

// Protected routes
router.use(verifyAccessToken);

const hackathonValidation = [
  body('title').trim().notEmpty().withMessage('Hackathon title is required.'),
  body('description').trim().notEmpty().withMessage('Hackathon description is required.'),
  body('mode').isIn(['online', 'offline', 'hybrid']).withMessage('Invalid mode.'),
  body('startDate').isISO8601().withMessage('Invalid start date.'),
  body('endDate').isISO8601().withMessage('Invalid end date.'),
  body('registrationDeadline').isISO8601().withMessage('Invalid registration deadline.')
];

router.post('/', requireRole('organizer', 'admin'), validate(hackathonValidation), createHackathon);
router.patch('/:id', requireRole('organizer', 'admin'), updateHackathon);
router.delete('/:id', requireRole('organizer', 'admin'), deleteHackathon);
router.post('/:id/register', registerTeamToHackathon);
router.post('/:id/banner', requireRole('organizer', 'admin'), uploadLimiter, upload.single('banner'), uploadBanner);

export default router;
