import User from '../models/User.js';
import PatientAssignment from '../models/PatientAssignment.js';
import CaseStudy from '../models/CaseStudy.js';

export const getDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    const assignments = await PatientAssignment.find({ studentId })
      .populate('patientId', 'name age gender contact')
      .populate('doctorId', 'name specialization');

    const caseStudies = await CaseStudy.find({ studentId })
      .populate('patientId', 'name')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });

    res.json({ assignments, caseStudies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssigned = async (req, res) => {
  try {
    const assignments = await PatientAssignment.find({ 
      studentId: req.user._id 
    })
    .populate('patientId', 'name email age gender contact profilePicture')
    .populate('doctorId', 'name email specialization profilePicture');

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCaseStudy = async (req, res) => {
  try {
    const { patientId, doctorId, title, notes, observations } = req.body;

    const caseStudy = await CaseStudy.create({
      studentId: req.user._id,
      patientId,
      doctorId,
      title,
      notes,
      observations
    });

    const populated = await CaseStudy.findById(caseStudy._id)
      .populate('patientId', 'name')
      .populate('doctorId', 'name specialization');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCaseStudies = async (req, res) => {
  try {
    const caseStudies = await CaseStudy.find({ 
      studentId: req.user._id 
    })
    .populate('patientId', 'name age gender')
    .populate('doctorId', 'name specialization')
    .sort({ createdAt: -1 });

    res.json(caseStudies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


