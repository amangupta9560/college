import { Router } from 'express';
import { body } from 'express-validator';
import { 
  createProject, getProjects, getProjectById, updateProject, deleteProject, uploadThumbnail 
} from '../controllers/projectController.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { uploadLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.use(verifyAccessToken);

const projectValidation = [
  body('title').trim().notEmpty().withMessage('Project title is required.'),
  body('description').trim().notEmpty().withMessage('Project description is required.')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters.'),
  body('techStack').isArray({ min: 1 }).withMessage('At least one technology must be listed.')
];

router.post('/', validate(projectValidation), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/thumbnail', uploadLimiter, upload.single('thumbnail'), uploadThumbnail);

export default router;
