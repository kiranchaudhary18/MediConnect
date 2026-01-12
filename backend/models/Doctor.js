import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  experience: Number,
  rating: Number,
  profilePicture: String,
  isActive: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model('Doctor', doctorSchema);
