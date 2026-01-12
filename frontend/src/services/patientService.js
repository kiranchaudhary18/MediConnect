// import axios from '../utils/axios';

// export const getPatientDashboard = async () => {
//   try {
//     const response = await axios.get('/patient/dashboard');
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching dashboard data:', error);
//     throw error;
//   }
// };

// export const getPatientAppointments = async (status) => {
//   try {
//     const url = status 
//       ? `/patient/appointments?status=${status}`
//       : '/patient/appointments';
//     const response = await axios.get(url);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching appointments:', error);
//     throw error;
//   }
// };

// export const bookAppointment = async (appointmentData) => {
//   try {
//     const response = await axios.post('/patient/appointment', appointmentData);
//     return response.data;
//   } catch (error) {
//     console.error('Error booking appointment:', error);
//     throw error;
//   }
// };

// export const cancelAppointment = async (appointmentId) => {
//   try {
//     const response = await axios.patch(`/patient/appointment/cancel/${appointmentId}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error cancelling appointment:', error);
//     throw error;
//   }
// };

// export const rescheduleAppointment = async (appointmentId, newDate, newTime) => {
//   try {
//     const response = await axios.patch(`/patient/appointment/reschedule/${appointmentId}`, {
//       date: newDate,
//       time: newTime
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error rescheduling appointment:', error);
//     throw error;
//   }
// };

// export const getMedicalHistory = async () => {
//   try {
//     const response = await axios.get('/patient/medical-history');
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching medical history:', error);
//     throw error;
//   }
// };

// export const uploadMedicalRecord = async (file, recordData) => {
//   try {
//     const formData = new FormData();
//     formData.append('file', file);
//     Object.keys(recordData).forEach(key => {
//       formData.append(key, recordData[key]);
//     });

//     const response = await axios.post('/patient/medical-history/upload', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
    
//     return response.data;
//   } catch (error) {
//     console.error('Error uploading medical record:', error);
//     throw error;
//   }
// };




// import axios from '../utils/axios';

// /* ================= DASHBOARD ================= */
// export const getPatientDashboard = async () => {
//   const res = await axios.get('/patient/dashboard');
//   return res.data;
// };

// /* ================= APPOINTMENTS ================= */
// export const getPatientAppointments = async () => {
//   const res = await axios.get('/patient/appointments');
//   return res.data;
// };

// export const bookAppointment = async (appointmentData) => {
//   const res = await axios.post('/patient/appointment', appointmentData);
//   return res.data;
// };

// export const cancelAppointment = async (appointmentId) => {
//   const res = await axios.patch(
//     `/patient/appointment/${appointmentId}/cancel`
//   );
//   return res.data;
// };

// /* ================= MEDICAL HISTORY ================= */
// export const getMedicalHistory = async () => {
//   const res = await axios.get('/patient/medical-history');
//   return res.data;
// };

// export const uploadMedicalRecord = async (file, recordData) => {
//   const formData = new FormData();
//   formData.append('file', file);

//   Object.entries(recordData).forEach(([key, value]) => {
//     formData.append(key, value);
//   });

//   const res = await axios.post(
//     '/patient/medical-history',
//     formData,
//     {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     }
//   );

//   return res.data;
// };





import axios from '../utils/axios';

/* ================= DASHBOARD ================= */
export const getPatientDashboard = async () => {
  const res = await axios.get('/patient/dashboard');
  return res.data;
};

/* ================= APPOINTMENTS ================= */
export const getPatientAppointments = async () => {
  const res = await axios.get('/patient/appointments');
  return res.data;
};

export const getAvailableDoctors = async () => {
  const res = await axios.get('/patient/doctors');
  return res.data;
};

export const getDoctorAppointments = async () => {
  const res = await axios.get('/patient/doctor-appointments');
  return res.data;
};

export const updateDoctorAppointmentStatus = async (id, status) => {
  const res = await axios.patch(`/patient/doctor-appointments/${id}/status`, { status });
  return res.data;
};

export const bookAppointment = async (appointmentData) => {
  const res = await axios.post('/patient/appointment', appointmentData);
  return res.data;
};

export const cancelAppointment = async (appointmentId) => {
  const res = await axios.patch(
    `/patient/appointment/${appointmentId}/cancel`
  );
  return res.data;
};

export const rescheduleAppointment = async (appointmentId, { date, time }) => {
  const res = await axios.patch(
    `/patient/appointment/${appointmentId}/reschedule`,
    { date, time }
  );
  return res.data;
};

/* ================= MEDICAL HISTORY ================= */
export const getMedicalHistory = async () => {
  const res = await axios.get('/patient/medical-history');
  return res.data;
};

export const getDoctorMedicalRecords = async () => {
  const res = await axios.get('/patient/medical-history/all');
  return res.data;
};

export const uploadMedicalRecord = async (file, recordData) => {
  const formData = new FormData();
  formData.append('file', file);

  Object.entries(recordData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const res = await axios.post(
    '/patient/medical-history',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return res.data;
};

export const updateMedicalRecord = async (id, recordData, file) => {
  const formData = new FormData();
  
  if (file) {
    formData.append('file', file);
  }

  Object.entries(recordData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  const res = await axios.patch(
    `/patient/medical-history/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return res.data;
};

/* ================= DOCTOR: PATIENTS ================= */
export const getDoctorPatients = async () => {
  const res = await axios.get('/patient/doctor-patients');
  return res.data;
};

export const getDoctorDashboardStats = async () => {
  const res = await axios.get('/patient/doctor-dashboard');
  return res.data;
};

/* ================= NOTIFICATIONS & HEALTH TIPS ================= */
export const sendHealthTip = async (payload) => {
  const res = await axios.post('/patient/notifications/health-tip', payload);
  return res.data;
};

export const generateHealthTipAI = async (payload) => {
  const res = await axios.post('/patient/notifications/health-tip/generate', payload);
  return res.data;
};

export const getNotifications = async () => {
  const res = await axios.get('/patient/notifications');
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await axios.patch(`/patient/notifications/${id}/read`);
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await axios.delete(`/patient/notifications/${id}`);
  return res.data;
};

/* ================= STUDENT: MEDICAL RECORDS ================= */
export const getStudentMedicalRecords = async () => {
  const res = await axios.get('/patient/student/medical-records');
  return res.data;
};
