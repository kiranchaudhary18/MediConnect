import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getPatientDashboard,
  getDoctors,
  bookAppointment,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getPrescriptions,
  uploadReport,
  getHealthReports,
  getMedicalHistory,
  uploadMedicalRecord
} from '../controllers/patientController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Apply authentication and authorization middleware
router.use(protect);
router.use(authorize('patient', 'admin'));

// Dashboard routes
router.get('/dashboard/:patientId?', getPatientDashboard);

// Doctor routes
router.get('/doctors', getDoctors);

// Appointment routes
router.post('/appointment', bookAppointment);
router.get('/appointments/:patientId?', getAppointments);
router.patch('/appointment/cancel/:id', cancelAppointment);
router.patch('/appointment/reschedule/:id', rescheduleAppointment);

// Prescription routes
router.get('/prescriptions', getPrescriptions);

// Medical Records routes
router.get('/medical-history/:patientId?', getMedicalHistory);
router.post('/medical-history/upload', upload.single('file'), uploadMedicalRecord);

// Health Report routes (legacy, consider merging with medical history)
router.post('/upload-report', upload.single('file'), uploadReport);
router.get('/reports', getHealthReports);

export default router;


