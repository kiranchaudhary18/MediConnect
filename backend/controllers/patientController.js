import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import HealthReport from '../models/HealthReport.js';
import cloudinary from '../config/cloudinary.js';
import { v2 as cloudinaryLib } from 'cloudinary';

export const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('name email specialization experience profilePicture bio')
      .sort({ name: 1 });
    
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date,
      time,
      reason
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name email specialization');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      patientId: req.user._id 
    })
    .populate('doctorId', 'name email specialization profilePicture')
    .sort({ date: -1 });

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

