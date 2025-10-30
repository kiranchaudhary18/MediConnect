import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getDashboard,
  getAssigned,
  createCaseStudy,
  getCaseStudies
} from '../controllers/studentController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student', 'admin'));

router.get('/dashboard', getDashboard);
router.get('/assigned', getAssigned);
router.post('/case-study', createCaseStudy);
router.get('/case-studies', getCaseStudies);

export default router;


