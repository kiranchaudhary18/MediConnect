import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getDoctors,
  bookAppointment,
  getAppointments,
  getPrescriptions,
  uploadReport,
  getHealthReports
} from '../controllers/patientController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(protect);
router.use(authorize('patient', 'admin'));

router.get('/doctors', getDoctors);
router.post('/appointment', bookAppointment);
router.get('/appointments', getAppointments);
router.get('/prescriptions', getPrescriptions);
router.post('/upload-report', upload.single('file'), uploadReport);
router.get('/reports', getHealthReports);

export default router;


