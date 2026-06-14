import { Router } from 'express';
import { body } from 'express-validator';
import { createReport } from '../controllers/reportController.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(verifyAccessToken);

const reportValidation = [
  body('targetType').isIn(['user', 'team', 'review', 'message']).withMessage('Invalid target type.'),
  body('targetId').trim().notEmpty().withMessage('Target ID is required.'),
  body('reason').isIn(['spam', 'harassment', 'fake', 'inappropriate', 'other']).withMessage('Invalid reason.')
];

router.post('/', validate(reportValidation), createReport);

export default router;
