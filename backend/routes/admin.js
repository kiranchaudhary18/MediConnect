import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getUsers,
  updateUser,
  deleteUser,
  getAnalytics
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);
router.get('/analytics', getAnalytics);

export default router;


