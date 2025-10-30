import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getDashboard,
  getPatients,
  createPatient,
  updatePatient,
  getAppointments,
  updateAppointment,
  getStudents,
  assignStudent,
  createPrescription,
  uploadReport,
  getHealthReports
} from '../controllers/doctorController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(protect);
router.use(authorize('doctor', 'admin'));

router.get('/dashboard', getDashboard);
router.get('/patients', getPatients);
router.post('/patient', createPatient);
router.put('/patient/:id', updatePatient);
router.get('/appointments', getAppointments);
router.put('/appointment/:id', updateAppointment);
router.get('/students', getStudents);
router.post('/assign-student', assignStudent);
router.post('/prescription', createPrescription);
router.post('/upload-report', upload.single('file'), uploadReport);
router.get('/reports/:patientId', getHealthReports);

export default router;


