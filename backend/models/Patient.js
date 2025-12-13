import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  // Reference to User model for authentication
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Personal Information
  fullName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer not to say'],
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
    default: 'unknown'
  },
  
  // Contact Information
  phone: {
    type: String,
    required: true
  },
  alternatePhone: String,
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  
  // Medical Information
  height: {
    value: Number,  // in cm
    unit: { type: String, default: 'cm' }
  },
  weight: {
    value: Number,  // in kg
    unit: { type: String, default: 'kg' }
  },
  
  // Medical History
  allergies: [{
    name: String,
    severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
    notes: String
  }],
  
  medicalConditions: [{
    name: String,
    diagnosisDate: Date,
    status: { type: String, enum: ['active', 'inactive', 'resolved'] },
    notes: String
  }],
  
  // Current Medications
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'  // Reference to doctor
    },
    notes: String
  }],
  
  // Insurance Information
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    validUntil: Date
  },
  
  // Additional Information
  occupation: String,
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed', 'other']
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
patientSchema.index({ user: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ 'emergencyContact.phone': 1 });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
