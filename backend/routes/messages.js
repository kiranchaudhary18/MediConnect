import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getMyPatients,
  getMyDoctors,
} from '../controllers/messageController.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/my-patients', getMyPatients);
router.get('/my-doctors', getMyDoctors);
router.get('/:partnerId', getMessages);
router.post('/send', sendMessage);
router.patch('/:messageId/read', markAsRead);

export default router;
