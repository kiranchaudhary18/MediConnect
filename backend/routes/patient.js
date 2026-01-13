// import express from 'express';
// import { protect } from '../middleware/auth.js';
// import {
//   getDashboard,
//   getDoctors,
//   bookAppointment,
//   getAppointments,
//   cancelAppointment,
//   getMedicalHistory
// } from '../controllers/patientController.js';

// const router = express.Router();

// router.use(protect);

// router.get('/dashboard', getDashboard);
// router.get('/doctors', getDoctors);

// router.post('/appointment', bookAppointment);
// router.get('/appointments', getAppointments);
// router.patch('/appointment/:id/cancel', cancelAppointment);

// router.get('/medical-history', getMedicalHistory);

// export default router;



import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

import { upload } from '../middleware/upload.js';
import {
  addMedicalHistory,
  getDoctorMedicalRecords,
  updateMedicalRecord,
  sendHealthTip,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  generateHealthTipAI,
  generateSymptomAI
} from '../controllers/patientController.js';


import {
  getDashboard,
  bookAppointment,
  getAppointments,
  cancelAppointment,
  getMedicalHistory,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAvailableDoctors,
  rescheduleAppointment,
  getDoctorPatients,
  getDoctorDashboardStats
} from '../controllers/patientController.js';

const router = express.Router();

// Public: AI Symptom Checker (uses server-side Grok API key)
router.post('/symptom-check', generateSymptomAI);

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/doctors', getAvailableDoctors);
router.post('/appointment', bookAppointment);
router.get('/appointments', getAppointments);
router.patch('/appointment/:id/reschedule', rescheduleAppointment);
router.get('/doctor-appointments', authorize('doctor'), getDoctorAppointments);
router.patch('/doctor-appointments/:id/status', authorize('doctor'), updateAppointmentStatus);
router.get('/doctor-patients', authorize('doctor'), getDoctorPatients);
router.get('/doctor-dashboard', authorize('doctor'), getDoctorDashboardStats);
router.patch('/appointment/:id/cancel', cancelAppointment);
router.get('/medical-history', getMedicalHistory);
router.post(
  '/medical-history',
  upload.single('file'),
  addMedicalHistory
);

// Doctor: list records created by the doctor
router.get(
  '/medical-history/all',
  authorize('doctor'),
  getDoctorMedicalRecords
);

// Doctor: update medical record
router.patch(
  '/medical-history/:id',
  authorize('doctor'),
  upload.single('file'),
  updateMedicalRecord
);

// Doctor: send health tip / notification
router.post(
  '/notifications/health-tip',
  authorize('doctor'),
  sendHealthTip
);

// Doctor: generate health tip via Grok
router.post(
  '/notifications/health-tip/generate',
  authorize('doctor'),
  generateHealthTipAI
);

// User: get notifications
router.get('/notifications', getNotifications);

// User: mark notification read
router.patch('/notifications/:id/read', markNotificationRead);

// User: delete notification
router.delete('/notifications/:id', deleteNotification);

// Student: get anonymized medical records for learning
import { getStudentMedicalRecords } from '../controllers/patientController.js';
router.get('/student/medical-records', authorize('student'), getStudentMedicalRecords);

export default router;
