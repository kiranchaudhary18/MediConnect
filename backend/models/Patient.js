import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    fullName: {
      type: String,
      required: true
    },
    gender: String,
    bloodGroup: String,
    phone: String,

    height: Number,
    weight: Number
  },
  { timestamps: true }
);

export default mongoose.model('Patient', patientSchema);
