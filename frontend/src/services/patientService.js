import axios from '../utils/axios';

export const getPatientDashboard = async () => {
  try {
    const response = await axios.get('/patient/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export const getPatientAppointments = async (status) => {
  try {
    const url = status 
      ? `/patient/appointments?status=${status}`
      : '/patient/appointments';
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const bookAppointment = async (appointmentData) => {
  try {
    const response = await axios.post('/patient/appointment', appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await axios.patch(`/patient/appointment/cancel/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

export const rescheduleAppointment = async (appointmentId, newDate, newTime) => {
  try {
    const response = await axios.patch(`/patient/appointment/reschedule/${appointmentId}`, {
      date: newDate,
      time: newTime
    });
    return response.data;
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    throw error;
  }
};

export const getMedicalHistory = async () => {
  try {
    const response = await axios.get('/patient/medical-history');
    return response.data;
  } catch (error) {
    console.error('Error fetching medical history:', error);
    throw error;
  }
};

export const uploadMedicalRecord = async (file, recordData) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(recordData).forEach(key => {
      formData.append(key, recordData[key]);
    });

    const response = await axios.post('/patient/medical-history/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading medical record:', error);
    throw error;
  }
};
