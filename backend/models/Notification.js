import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    tag: { type: String },
    type: { 
      type: String, 
      enum: ['health_tip', 'system', 'student_request', 'student_accepted', 'student_rejected', 'assignment'], 
      default: 'system' 
    },
    read: { type: Boolean, default: false },
    targetEmail: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
