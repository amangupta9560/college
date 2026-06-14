import { Router } from 'express';
import { body, query } from 'express-validator';
import { 
  createTeam, listTeams, getTeam, updateTeam, deleteTeam, addMember, removeMember 
} from '../controllers/teamController.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(verifyAccessToken);

const createTeamValidation = [
  body('name').trim().notEmpty().isLength({ max: 80 }).withMessage('Team name is required and cannot exceed 80 characters.'),
  body('description').trim().notEmpty().withMessage('Team description is required.'),
  body('projectType').isIn(['hackathon', 'fyp', 'startup', 'research', 'opensource']).withMessage('Invalid project type.'),
  body('maxSize').optional().isInt({ min: 2, max: 10 }).withMessage('Max size must be between 2 and 10.')
];

const updateTeamValidation = [
  body('name').optional().trim().notEmpty().isLength({ max: 80 }),
  body('description').optional().trim().notEmpty(),
  body('maxSize').optional().isInt({ min: 2, max: 10 })
];

router.post('/', apiLimiter, validate(createTeamValidation), createTeam);
router.get('/', listTeams);
router.get('/:id', getTeam);
router.patch('/:id', apiLimiter, validate(updateTeamValidation), updateTeam);
router.delete('/:id', deleteTeam);

router.post('/:id/members/:userId', addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
