import express from 'express';
import { protect } from '../middleware/auth.js';
import { getMessages, getConversations } from '../controllers/chatController.js';

const router = express.Router();

router.use(protect);

router.get('/:conversationId', getMessages);
router.get('/', getConversations);

export default router;


