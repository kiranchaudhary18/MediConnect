import mongoose from 'mongoose';

const caseStudySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    required: true
  },
  observations: {
    type: String,
    trim: true
  },
  feedback: {
    type: String,
    trim: true
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F'],
    default: null
  },
  attachments: [{
    type: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('CaseStudy', caseStudySchema);


