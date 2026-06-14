import { Router } from 'express';
import { getConversationHistory, deleteMessage, getConversationsList } from '../controllers/messageController.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyAccessToken);

router.get('/', getConversationsList);
router.get('/:conversationId', getConversationHistory);
router.delete('/:id', deleteMessage);

export default router;
