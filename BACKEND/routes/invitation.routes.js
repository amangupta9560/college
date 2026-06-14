import { Router } from 'express';
import { body } from 'express-validator';
import { 
  sendInvitation, listReceivedInvitations, listSentInvitations, 
  acceptInvitation, rejectInvitation, cancelInvitation 
} from '../controllers/invitationController.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(verifyAccessToken);

const inviteValidation = [
  body('teamId').isMongoId().withMessage('Invalid Team ID format.'),
  body('inviteeId').isMongoId().withMessage('Invalid Invitee User ID format.'),
  body('role').trim().notEmpty().withMessage('Proposed role is required.'),
  body('message').optional().isLength({ max: 300 }).withMessage('Personal note cannot exceed 300 characters.')
];

router.post('/', apiLimiter, validate(inviteValidation), sendInvitation);
router.get('/received', listReceivedInvitations);
router.get('/sent', listSentInvitations);
router.patch('/:id/accept', acceptInvitation);
router.patch('/:id/reject', rejectInvitation);
router.delete('/:id', cancelInvitation);

export default router;
