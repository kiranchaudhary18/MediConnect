import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  experience: {
    type: Number,
    required: true
  },
  education: [{
    degree: String,
    university: String,
    year: Number
  }],
  specializationAreas: [{
    type: String,
    trim: true
  }],
  consultationFee: {
    type: Number,
    required: true
  },
  availableDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  availableHours: {
    start: String,  // Format: "09:00"
    end: String     // Format: "17:00"
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    trim: true
  },
  languages: [{
    type: String,
    trim: true
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  hospitalAffiliation: [{
    name: String,
    position: String,
    from: Date,
    to: Date,
    current: Boolean
  }],
  awards: [{
    title: String,
    year: Number,
    description: String
  }],
  membership: [{
    organization: String,
    position: String,
    year: Number
  }]
}, {
  timestamps: true
});

// Indexes
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ 'specializationAreas': 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
