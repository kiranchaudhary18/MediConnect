import express from 'express';
import { protect } from '../middleware/auth.js';
import { analyzeSymptoms } from '../controllers/aiController.js';

const router = express.Router();

// Protect all AI routes
router.use(protect);

// Route for symptom analysis
router.post('/analyze-symptoms', analyzeSymptoms);

export default router;
