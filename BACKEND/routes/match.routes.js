import { Router } from 'express';
import { getRecommendations, getTeamRecommendations } from '../controllers/matchController.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.use(verifyAccessToken);

router.get('/recommendations', apiLimiter, getRecommendations);
router.get('/team/:teamId', apiLimiter, getTeamRecommendations);

export default router;
