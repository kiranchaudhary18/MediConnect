import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['prescription', 'lab_test', 'report', 'other']
  },
  doctor: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Prescription', 'Lab Test', 'Report']
  }
}, {
  timestamps: true
});

export default mongoose.model('MedicalRecord', medicalRecordSchema);
