import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  phone: {
    type: String,
    required: true
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  education: [{
    degree: String,
    institution: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    description: String
  }],
  currentSemester: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  assignedDoctors: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active'
    }
  }],
  academicRecord: [{
    course: String,
    grade: String,
    semester: Number,
    year: Number,
    credits: Number
  }],
  attendance: [{
    date: Date,
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused']
    },
    notes: String
  }],
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

// Indexes
studentSchema.index({ studentId: 1 });
studentSchema.index({ department: 1, currentSemester: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
