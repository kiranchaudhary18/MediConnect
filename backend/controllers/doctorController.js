import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import PatientAssignment from '../models/PatientAssignment.js';
import HealthReport from '../models/HealthReport.js';
import cloudinary from '../config/cloudinary.js';
import { v2 as cloudinaryLib } from 'cloudinary';

export const getDashboard = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const totalPatients = await PatientAssignment.countDocuments({ 
      doctorId, 
      status: 'active' 
    });

    const totalStudents = await User.countDocuments({ 
      role: 'student' 
    });

    const totalAppointments = await Appointment.countDocuments({ doctorId });
    
    const pendingAppointments = await Appointment.countDocuments({ 
      doctorId, 
      status: 'pending' 
    });

    res.json({
      totalPatients,
      totalStudents,
      totalAppointments,
      pendingAppointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatients = async (req, res) => {
  try {
    const patients = await PatientAssignment.find({ 
      doctorId: req.user._id 
    })
    .populate('patientId', 'name email age gender contact profilePicture')
    .populate('studentId', 'name email year profilePicture');

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPatient = async (req, res) => {
  try {
    const { name, email, age, gender, contact, address } = req.body;

    const patient = await User.create({
      name,
      email,
      password: 'defaultpass123',
      role: 'patient',
      age,
      gender,
      contact,
      address
    });

    await PatientAssignment.create({
      patientId: patient._id,
      doctorId: req.user._id
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const patient = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      doctorId: req.user._id 
    })
    .populate('patientId', 'name email age gender contact')
    .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    ).populate('patientId', 'name email');

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email year profilePicture');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignStudent = async (req, res) => {
  try {
    const { patientId, studentId } = req.body;
    
    const assignment = await PatientAssignment.findOneAndUpdate(
      { patientId, doctorId: req.user._id },
      { studentId },
      { new: true, upsert: true }
    );

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medicines, advice, diagnosis } = req.body;

    const prescription = await Prescription.create({
      doctorId: req.user._id,
      patientId,
      appointmentId,
      medicines,
      advice,
      diagnosis
    });

    res.status(201).json(prescription);
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
      patientId: req.body.patientId,
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
      patientId: req.params.patientId 
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


