import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['Prescription', 'Lab Test', 'Report']
    },
    doctorName: String,
    date: Date,
    fileUrl: String
  },
  { timestamps: true }
);

export default mongoose.model('MedicalRecord', medicalRecordSchema);
