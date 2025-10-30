import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medicines: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    }
  }],
  advice: {
    type: String,
    trim: true
  },
  diagnosis: {
    type: String,
    trim: true
  },
  pdfUrl: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Prescription', prescriptionSchema);


