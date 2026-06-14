import { Router } from 'express';
import { 
  getNotifications, markRead, markAllRead, deleteNotification 
} from '../controllers/notificationController.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.use(verifyAccessToken);

router.get('/', getNotifications);
router.patch('/:id/read', markRead);
router.patch('/read-all', apiLimiter, markAllRead);
router.delete('/:id', deleteNotification);

export default router;
