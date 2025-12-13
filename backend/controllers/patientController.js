import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Prescription from '../models/Prescription.js';
import HealthReport from '../models/HealthReport.js';
import cloudinary from '../config/cloudinary.js';
import { v2 as cloudinaryLib } from 'cloudinary';
import mongoose from 'mongoose';

// Dashboard related controllers
export const getPatientDashboard = async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user._id;
    
    // Get next appointment
    const nextAppointment = await Appointment.findOne({
      patientId,
      status: { $in: ['pending', 'approved'] },
      date: { $gte: new Date() }
    })
    .sort({ date: 1, time: 1 })
    .populate('doctorId', 'name specialization profilePicture');

    // Get recent activities (last 5)
    const recentActivities = [];
    
    // Add recent appointments
    const recentAppointments = await Appointment.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('doctorId', 'name specialization');
    
    recentAppointments.forEach(apt => {
      recentActivities.push({
        type: 'appointment',
        title: `Appointment with Dr. ${apt.doctorId.name}`,
        date: apt.date,
        status: apt.status,
        id: apt._id
      });
    });

    // Add recent medical records (prescriptions, lab tests, reports)
    const recentRecords = await MedicalRecord.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(2);
    
    recentRecords.forEach(record => {
      recentActivities.push({
        type: record.type,
        title: `${record.category}: ${record.title}`,
        date: record.date,
        id: record._id
      });
    });

    // Sort all activities by date
    recentActivities.sort((a, b) => b.date - a.date);

    // Dummy health data (in a real app, this would come from health records)
    const healthSummary = {
      bloodPressure: "120/80",
      sugarLevel: "92 mg/dL",
      weight: "70 kg",
      bmi: "23.5"
    };

    // Dummy health trends data for the chart (last 7 days)
    const healthTrends = [
      { date: '2023-11-20', value: 70, type: 'weight' },
      { date: '2023-11-21', value: 70.2, type: 'weight' },
      { date: '2023-11-22', value: 69.8, type: 'weight' },
      { date: '2023-11-23', value: 70.1, type: 'weight' },
      { date: '2023-11-24', value: 69.9, type: 'weight' },
      { date: '2023-11-25', value: 70, type: 'weight' },
      { date: '2023-11-26', value: 69.8, type: 'weight' },
    ];

    res.json({
      nextAppointment,
      healthSummary,
      healthTrends,
      recentActivities: recentActivities.slice(0, 5) // Return only the 5 most recent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Doctor related controllers
export const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('name email specialization experience profilePicture bio rating')
      .sort({ name: 1 });
    
    // In a real app, you might want to calculate the rating from reviews
    const doctorsWithRating = doctors.map(doctor => ({
      ...doctor.toObject(),
      rating: doctor.rating || (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5 for demo
      experience: doctor.experience || `${Math.floor(Math.random() * 15) + 5} years`
    }));
    
    res.json(doctorsWithRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Appointment related controllers
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date: new Date(date),
      time,
      reason,
      status: 'pending'
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name specialization profilePicture');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, patientId: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or you do not have permission to cancel it' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, patientId: req.user._id },
      { 
        date: new Date(date),
        time,
        status: 'pending', // Reset status to pending for doctor's approval
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or you do not have permission to reschedule it' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const patientId = req.params.patientId || req.user._id;
    
    let query = { patientId };
    
    // Filter by status if provided
    if (status) {
      if (status.toLowerCase() === 'upcoming') {
        query.status = { $in: ['pending', 'approved'] };
        query.date = { $gte: new Date() };
      } else if (status.toLowerCase() === 'completed') {
        query.status = 'completed';
      } else if (status.toLowerCase() === 'cancelled') {
        query.status = 'cancelled';
      }
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'name specialization profilePicture')
      .sort({ date: -1, time: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      patientId: req.user._id 
    })
    .populate('doctorId', 'name email specialization')
    .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await cloudinaryLib.uploader.upload(req.file.path, {
      folder: 'mediconnect/reports'
    });

    const report = await HealthReport.create({
      patientId: req.user._id,
      reportType: req.body.reportType,
      fileUrl: result.secure_url,
      notes: req.body.notes
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHealthReports = async (req, res) => {
  try {
    const reports = await HealthReport.find({ 
      patientId: req.user._id 
    }).sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Medical History related controllers
export const getMedicalHistory = async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user._id;
    
    const medicalRecords = await MedicalRecord.find({ patientId })
      .sort({ date: -1 });
    
    res.json(medicalRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadMedicalRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinaryLib.uploader.upload(req.file.path, {
      folder: 'mediconnect/medical-records'
    });

    // Create medical record
    const medicalRecord = await MedicalRecord.create({
      patientId: req.user._id,
      title: req.body.title || req.file.originalname,
      type: req.body.type || 'other',
      doctor: req.body.doctor || 'Dr. Unknown',
      date: req.body.date || new Date(),
      description: req.body.description,
      fileUrl: result.secure_url,
      category: req.body.category || 'Report'
    });

    res.status(201).json(medicalRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
