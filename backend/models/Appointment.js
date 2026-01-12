// import mongoose from 'mongoose';

// const appointmentSchema = new mongoose.Schema({
//   patient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   doctorName: {
//     type: String,
//     required: true
//   },
//   specialization: String,
//   date: Date,
//   time: String,
//   reason: String,
//   status: {
//     type: String,
//     enum: ['upcoming', 'completed', 'cancelled'],
//     default: 'upcoming'
//   }
// }, { timestamps: true });

// export default mongoose.model('Appointment', appointmentSchema);


import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    doctorName: {
      type: String,
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    time: {
      type: String,
      required: true
    },

    reason: {
      type: String
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'not_available'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Appointment', appointmentSchema);
