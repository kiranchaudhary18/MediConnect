// import Appointment from '../models/Appointment.js';
// import Doctor from '../models/Doctor.js';
// import MedicalRecord from '../models/MedicalRecord.js';

// /* ---------------- DASHBOARD ---------------- */
// export const getDashboard = async (req, res) => {
//   try {
//     const patientId = req.user._id;

//     const nextAppointment = await Appointment.findOne({
//       patient: patientId,
//       status: 'upcoming'
//     })
//       .sort({ date: 1 })
//       .populate('doctor');

//     res.json({
//       nextAppointment,
//       healthSummary: {
//         bloodPressure: '120/80',
//         sugar: '92 mg/dL',
//         weight: '70 kg',
//         bmi: 23.5
//       },
//       recentActivities: []
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ---------------- DOCTORS LIST ---------------- */
// export const getDoctors = async (req, res) => {
//   try {
//     const doctors = await Doctor.find({ isActive: true });
//     res.json(doctors);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ---------------- BOOK APPOINTMENT ---------------- */
// export const bookAppointment = async (req, res) => {
//   try {
//     const { doctorId, doctorName, date, time, reason } = req.body;

//     const appointment = await Appointment.create({
//       patient: req.user._id,
//       doctor: doctorId,
//       doctorName,
//       date,
//       time,
//       reason
//     });

//     res.status(201).json(appointment);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ---------------- MY APPOINTMENTS ---------------- */
// export const getAppointments = async (req, res) => {
//   try {
//     const appointments = await Appointment.find({
//       patient: req.user._id
//     }).populate('doctor');

//     res.json(appointments);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ---------------- CANCEL APPOINTMENT ---------------- */
// export const cancelAppointment = async (req, res) => {
//   try {
//     const appointment = await Appointment.findOneAndUpdate(
//       { _id: req.params.id, patient: req.user._id },
//       { status: 'cancelled' },
//       { new: true }
//     );

//     res.json(appointment);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ---------------- MEDICAL HISTORY ---------------- */
// export const getMedicalHistory = async (req, res) => {
//   try {
//     const records = await MedicalRecord.find({
//       patient: req.user._id
//     }).sort({ date: -1 });

//     res.json(records);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



import axios from 'axios';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import ChatHistory from '../models/ChatHistory.js';
import Assignment from '../models/Assignment.js';
import StudentDoctorSelection from '../models/StudentDoctorSelection.js';

/* ---------------- DASHBOARD ---------------- */
export const getDashboard = async (req, res) => {
  try {
    const patientId = req.user._id;

    const today = new Date();
    const twoDaysLater = new Date();
    twoDaysLater.setDate(today.getDate() + 2);

    // 🔹 1) Appointment within next 2 days
    let nextAppointment = await Appointment.findOne({
      patient: patientId,
      status: { $in: ['pending', 'confirmed'] },
      date: {
        $gte: today,
        $lte: twoDaysLater
      }
    }).sort({ date: 1 });

    // 🔹 2) If not found, get latest upcoming
    if (!nextAppointment) {
      nextAppointment = await Appointment.findOne({
        patient: patientId,
        status: { $in: ['pending', 'confirmed'] }
      }).sort({ date: 1 });
    }

    // 🔹 Recent activities (already working)
    const latestAppointment = await Appointment.findOne({
      patient: patientId
    }).sort({ createdAt: -1 });

    const latestMedical = await MedicalRecord.findOne({
      patient: patientId
    }).sort({ createdAt: -1 });

    const recentActivities = [];

    if (latestAppointment) {
      recentActivities.push({
        type: 'appointment',
        title: 'Appointment Booked',
        description: `Appointment with ${latestAppointment.doctorName} on ${latestAppointment.date.toDateString()} at ${latestAppointment.time}`,
        time: 'Recently'
      });
    }

    if (latestMedical) {
      recentActivities.push({
        type: 'medical',
        title: 'Medical Record Added',
        description: `${latestMedical.title} added by ${latestMedical.doctorName}`,
        time: 'Recently'
      });
    }

    recentActivities.push({
      type: 'system',
      title: 'Profile Updated',
      description: 'Your profile information was updated',
      time: '1 day ago'
    });

    res.json({
      nextAppointment,
      healthSummary: {
        bloodPressure: '120/80',
        sugar: '92 mg/dL',
        weight: '70 kg',
        bmi: 23.5
      },
      recentActivities
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ---------------- BOOK APPOINTMENT ---------------- */
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, doctorName, date, time, reason } = req.body;

    if (!doctorId) {
      return res.status(400).json({ message: 'doctorId is required' });
    }

    let finalDoctorName = doctorName;
    if (!finalDoctorName) {
      const doctorUser = await User.findById(doctorId).select('name');
      if (!doctorUser) return res.status(404).json({ message: 'Doctor not found' });
      finalDoctorName = doctorUser.name;
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      doctorName: finalDoctorName,
      date,
      time,
      reason,
      status: 'pending'
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- MY APPOINTMENTS ---------------- */
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id
    }).sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- DOCTOR: MY APPOINTMENTS ---------------- */
export const getDoctorAppointments = async (req, res) => {
  try {
    // Match by doctor id to the logged-in doctor
    const appointments = await Appointment.find({
      doctor: req.user._id
    })
      .sort({ date: -1 })
      .populate('patient', 'name email');

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- DOCTOR: UPDATE APPOINTMENT STATUS ---------------- */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'not_available'

    const allowed = ['pending', 'confirmed', 'completed', 'cancelled', 'not_available'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const apt = await Appointment.findOne({ _id: id, doctor: req.user._id })
      .populate('patient', 'name email age gender')
      .populate('doctor', 'name specialization');

    if (!apt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    apt.status = status;

    // If status is completed, generate AI summary and create medical record
    if (status === 'completed' && apt.reason) {
      try {
        const summary = await generateAppointmentSummary(apt.reason, apt.patient?.name, apt.doctor?.specialization);
        apt.summary = summary;

        // Create a medical record for this completed appointment
        await MedicalRecord.create({
          patient: apt.patient._id,
          doctor: apt.doctor._id || req.user._id,
          title: `Consultation: ${apt.reason}`,
          description: summary,
          type: 'Report',
          doctorName: apt.doctorName || apt.doctor?.name,
          date: apt.date
        });
      } catch (aiErr) {
        console.error('AI summary generation failed:', aiErr.message);
        // Fallback summary
        apt.summary = `Patient consulted for: ${apt.reason}. Treatment provided as per medical assessment.`;
        
        await MedicalRecord.create({
          patient: apt.patient._id,
          doctor: apt.doctor._id || req.user._id,
          title: `Consultation: ${apt.reason}`,
          description: apt.summary,
          type: 'Report',
          doctorName: apt.doctorName || apt.doctor?.name,
          date: apt.date
        });
      }
    }

    await apt.save();

    res.json({ success: true, appointment: apt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function to generate AI summary for completed appointments
async function generateAppointmentSummary(reason, patientName, doctorSpecialization) {
  const prompt = `Generate a brief medical consultation summary for a patient visit.
Patient complaint/reason: "${reason}"
Doctor specialization: ${doctorSpecialization || 'General Physician'}

Create a professional 3-4 line summary that includes:
1. Brief assessment of the condition
2. Likely treatment approach taken
3. General recommendations for the patient

Keep it professional and general (no specific medications). Start directly with the summary.`;

  // Try Grok API if available
  if (process.env.GROK_API_KEY && process.env.GROK_API_KEY !== 'your_grok_api_key_here') {
    try {
      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: 'grok-2-latest',
          messages: [
            { role: 'system', content: 'You are a medical documentation assistant. Keep summaries brief and professional.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GROK_API_KEY}`
          },
          timeout: 15000
        }
      );
      return response.data?.choices?.[0]?.message?.content || generateFallbackSummary(reason);
    } catch (err) {
      console.error('Grok API error:', err.message);
      return generateFallbackSummary(reason);
    }
  }
  
  return generateFallbackSummary(reason);
}

// Fallback summary generator
function generateFallbackSummary(reason) {
  const reasonLower = reason.toLowerCase();
  
  const summaries = {
    fever: `Patient presented with fever symptoms. Physical examination conducted and vital signs monitored. Symptomatic treatment recommended with adequate hydration and rest. Follow-up advised if symptoms persist beyond 3 days.`,
    headache: `Patient complained of headache. Neurological examination performed with normal findings. Stress management and adequate rest advised. Pain management medication may be prescribed if needed.`,
    cold: `Patient presented with common cold symptoms including congestion and mild discomfort. Supportive care recommended with warm fluids and rest. Symptoms expected to resolve within 5-7 days.`,
    cough: `Patient presented with cough symptoms. Chest examination conducted. Hydration and steam inhalation recommended. Cough suppressants may be advised for nighttime relief.`,
    stomach: `Patient complained of stomach discomfort. Abdominal examination performed. Dietary modifications advised with bland diet. Antacids or digestive aids may be recommended.`,
    pain: `Patient presented with pain symptoms. Physical examination and assessment completed. Pain management approach discussed. Rest and appropriate medication advised as needed.`,
    diabetes: `Patient follow-up for diabetes management. Blood sugar levels reviewed. Dietary compliance and medication adherence discussed. Regular monitoring and lifestyle modifications emphasized.`,
    hypertension: `Patient consultation for blood pressure management. BP readings taken and reviewed. Medication compliance verified. Low-sodium diet and regular exercise recommended.`,
    checkup: `Routine health checkup completed. Vital signs within normal range. General health assessment satisfactory. Preventive care measures discussed.`
  };

  for (const [key, summary] of Object.entries(summaries)) {
    if (reasonLower.includes(key)) {
      return summary;
    }
  }

  return `Patient consulted for: ${reason}. Comprehensive examination performed based on presenting symptoms. Appropriate treatment plan discussed and recommendations provided. Follow-up advised as needed.`;
}

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- RESCHEDULE APPOINTMENT (Patient) ---------------- */
export const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: 'date and time are required' });
    }

    const appt = await Appointment.findOne({ _id: id, patient: req.user._id });
    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only allow reschedule if not completed/cancelled/not_available
    const disallowed = ['completed', 'cancelled', 'not_available'];
    if (disallowed.includes(appt.status)) {
      return res.status(400).json({ message: `Cannot reschedule ${appt.status} appointment` });
    }

    appt.date = new Date(date);
    appt.time = time;
    // After reschedule, set back to pending for doctor to re-confirm
    appt.status = 'pending';
    await appt.save();

    res.json({ success: true, appointment: appt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ---------------- MEDICAL HISTORY ---------------- */
export const getMedicalHistory = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      patient: req.user._id
    }).sort({ date: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ---------------- AVAILABLE DOCTORS (for patients) ---------------- */
export const getAvailableDoctors = async (req, res) => {
  try {
    // Get all doctors (remove isActive filter as field may not exist)
    const doctors = await User.find({ role: 'doctor' })
      .select('_id name email specialization experience profilePicture profilePhoto licenseNumber bio contact address createdAt');
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------- DOCTOR DASHBOARD STATS ---------------- */
export const getDoctorDashboardStats = async (req, res) => {
  try {
    // Ensure only doctors call this (route enforces authorize)
    const doctorId = req.user._id;

    const [allApts, pendingCount, studentsCount, completedApts] = await Promise.all([
      Appointment.countDocuments({ doctor: doctorId }),
      Appointment.countDocuments({ doctor: doctorId, status: 'pending' }),
      User.countDocuments({ role: 'student', isActive: true }),
      Appointment.find({ doctor: doctorId, status: 'completed' })
        .sort({ date: -1 })
        .limit(100)
        .populate('patient', 'name email')
    ]);

    // Unique patients from completed
    const uniquePatients = new Set();
    completedApts.forEach(a => { if (a.patient) uniquePatients.add(a.patient._id.toString()); });

    res.json({
      totalPatients: uniquePatients.size,
      totalStudents: studentsCount,
      totalAppointments: allApts,
      pendingAppointments: pendingCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const addMedicalHistory = async (req, res) => {
  try {
    const { title, doctorName, date, time, type, description, patientId, patientEmail } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    // Combine date and time if provided
    let recordDate = date ? new Date(date) : new Date();
    if (date && time) {
      // Expect time like '14:30' or '14:30:00'
      const timePart = time.length === 5 ? `${time}:00` : time;
      recordDate = new Date(`${date}T${timePart}`);
    }

    // Determine patient: if a doctor is creating and provided patientId/email, use them
    let patientRef = req.user._id;
    if (req.user.role === 'doctor') {
      if (patientEmail) {
        const found = await User.findOne({ email: patientEmail }).select('_id');
        if (!found) {
          return res.status(404).json({ message: 'Patient with this email not found' });
        }
        patientRef = found._id;
      } else if (patientId) {
        patientRef = patientId;
      }
    }

    const record = await MedicalRecord.create({
      patient: patientRef,
      doctor: req.user._id,
      title,
      description,
      doctorName,
      date: recordDate,
      type,
      fileUrl: `/uploads/${req.file.filename}`
    });

    res.status(201).json({
      success: true,
      record
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- DOCTOR: LIST OWN CREATED RECORDS ---------------- */
export const getDoctorMedicalRecords = async (req, res) => {
  try {
    // Only allow doctors; route will enforce authorize
    const records = await MedicalRecord.find({ doctor: req.user._id })
      .sort({ date: -1 })
      .populate('patient', 'name email');

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- DOCTOR: LIST OWN PATIENTS (from completed visits) ---------------- */
export const getDoctorPatients = async (req, res) => {
  try {
    const completedApts = await Appointment.find({
      doctor: req.user._id,
      status: 'completed'
    })
      .sort({ date: -1 })
      .populate('patient', 'name email age gender contact');

    const patientMap = new Map();
    for (const appt of completedApts) {
      const p = appt.patient;
      if (!p) continue;
      const key = p._id.toString();
      if (!patientMap.has(key)) {
        patientMap.set(key, {
          id: p._id,
          name: p.name,
          email: p.email,
          age: p.age || null,
          gender: p.gender || null,
          phone: p.contact || '',
          lastVisit: appt.date,
          nextAppointment: null
        });
      }
    }

    const patientIds = Array.from(patientMap.keys());
    await Promise.all(
      patientIds.map(async (pid) => {
        const nextApt = await Appointment.findOne({
          doctor: req.user._id,
          patient: pid,
          status: { $in: ['pending', 'confirmed'] }
        }).sort({ date: 1 });
        if (nextApt) {
          const entry = patientMap.get(pid);
          entry.nextAppointment = nextApt.date;
          patientMap.set(pid, entry);
        }
      })
    );

    const list = Array.from(patientMap.values());
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- DOCTOR: UPDATE MEDICAL RECORD ---------------- */
export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, date } = req.body;

    // Find the record and verify ownership
    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Only the doctor who created it can edit
    if (record.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this record' });
    }

    // Update fields
    if (title) record.title = title;
    if (description) record.description = description;
    if (type) record.type = type;
    if (date) record.date = new Date(date);
    
    // If new file is uploaded, update fileUrl
    if (req.file) {
      record.fileUrl = `/uploads/${req.file.filename}`;
    }

    await record.save();

    res.json({
      success: true,
      record
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- DOCTOR: SEND HEALTH TIP (Notification) ---------------- */
export const sendHealthTip = async (req, res) => {
  try {
    const { title, message, tag, targetEmail } = req.body;

    if (!title || !message || !targetEmail) {
      return res.status(400).json({ message: 'Title, message, and targetEmail are required' });
    }

    const recipient = await User.findOne({ email: targetEmail.toLowerCase() }).select('_id email role name');
    if (!recipient) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    const notification = await Notification.create({
      user: recipient._id,
      createdBy: req.user._id,
      title,
      message,
      tag,
      type: 'health_tip',
      read: false,
      targetEmail: recipient.email
    });

    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- USER: GET NOTIFICATIONS ---------------- */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- USER: MARK NOTIFICATION AS READ ---------------- */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- USER: DELETE NOTIFICATION ---------------- */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete notification id=${id} for user=${req.user?._id}`);

    // Lookup without deleting first to provide clearer errors
    const notification = await Notification.findById(id).lean();
    if (!notification) {
      console.warn(`Delete failed: notification not found id=${id}`);
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check ownership
    if (notification.user?.toString() !== req.user._id.toString()) {
      console.warn(`Delete forbidden: notification ${id} belongs to user=${notification.user} not ${req.user._id}`);
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    // Delete it
    await Notification.deleteOne({ _id: id });
    console.log(`Deleted notification id=${id} user=${req.user?._id}`);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('deleteNotification error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

/* ---------------- DOCTOR: GENERATE HEALTH TIP VIA GROK ---------------- */
export const generateHealthTipAI = async (req, res) => {
  try {
    const { condition, audience } = req.body;

    if (!condition) {
      return res.status(400).json({ message: 'Condition is required' });
    }

    // If no API key or API fails, use intelligent fallback
    const generateFallbackTip = (cond, aud) => {
      const tips = {
        diabetes: `**Managing Diabetes Effectively**

• Monitor your blood sugar levels regularly and keep a log
• Follow a balanced diet low in refined sugars and carbs
• Stay physically active with at least 30 minutes of daily exercise

⚠️ Always consult your doctor before making changes to medication or diet.`,
        hypertension: `**Controlling High Blood Pressure**

• Reduce salt intake to less than 5g per day
• Exercise regularly - aim for 150 minutes per week
• Manage stress through meditation or deep breathing

⚠️ Take medications as prescribed and monitor BP regularly.`,
        fever: `**Managing Fever Safely**

• Stay hydrated with water, soups, and electrolyte drinks
• Rest adequately to help your body recover
• Use a light blanket and keep room temperature comfortable

⚠️ Seek medical attention if fever exceeds 103°F or lasts more than 3 days.`,
        cold: `**Common Cold Relief Tips**

• Rest and stay hydrated with warm fluids
• Use saline nasal spray for congestion relief
• Honey and ginger tea can soothe sore throat

⚠️ Consult a doctor if symptoms worsen or persist beyond a week.`,
        headache: `**Headache Relief Guidelines**

• Stay hydrated and avoid skipping meals
• Rest in a quiet, dark room if possible
• Apply a cold or warm compress to your forehead

⚠️ Seek immediate care for sudden severe headaches or vision changes.`,
        default: `**Health Tips for ${cond}**

• Maintain a healthy lifestyle with balanced nutrition
• Get adequate rest and manage stress levels
• Stay hydrated and exercise regularly

⚠️ Always consult a healthcare professional for personalized advice.`
      };

      const key = cond.toLowerCase();
      for (const [k, v] of Object.entries(tips)) {
        if (key.includes(k)) return v;
      }
      return tips.default;
    };

    if (!process.env.GROK_API_KEY || process.env.GROK_API_KEY === 'your_grok_api_key_here') {
      // No API key - use fallback
      return res.json({ success: true, content: generateFallbackTip(condition, audience) });
    }

    const prompt = `You are a concise medical tip generator. Create a short, safe health tip for condition: "${condition}".
Target audience: ${audience || 'patient'}.
Return a brief title and 3 bullet points of practical advice (no diagnostics, no prescriptions), and end with one caution line.`;

    const payload = {
      model: 'grok-2-latest',
      messages: [
        { role: 'system', content: 'You are a concise, safety-first health tip assistant. Keep responses short.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 220,
      temperature: 0.7,
    };

    try {
      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GROK_API_KEY}`
          },
          timeout: 20000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        return res.json({ success: true, content: generateFallbackTip(condition, audience) });
      }

      res.json({ success: true, content });
    } catch (apiErr) {
      console.error('Grok API error:', apiErr.response?.data || apiErr.message);
      // Fallback to generated tips if API fails
      return res.json({ success: true, content: generateFallbackTip(condition, audience) });
    }
  } catch (err) {
    const message = err.message || 'AI generation failed';
    res.status(500).json({ message });
  }
};

/* ---------------- PUBLIC: SYMPTOM CHECK VIA GROK ---------------- */
export const generateSymptomAI = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ message: 'Symptoms are required' });
    }

    const generateFallback = (text) => {
      const t = text.toLowerCase();
      if (t.includes('fever')) return 'It may be a fever — rest, hydrate, and monitor temperature. Seek care if fever > 103°F or lasts > 3 days.';
      if (t.includes('cough')) return 'Cough could be viral or allergic. Stay hydrated, use steam inhalation, and see a doctor if breathing difficulties occur.';
      if (t.includes('headache')) return 'Headache may be tension or migraine related — rest in a quiet dark room, hydrate, and consider OTC pain relief if appropriate.';
      if (t.includes('stomach') || t.includes('abdominal')) return 'Stomach discomfort — try a bland diet and rest; seek care for severe pain or persistent vomiting.';
      return 'Based on your symptoms, consider rest, hydration, and monitoring. This tool does not replace professional medical advice — consult a clinician if symptoms worsen.';
    };

    console.log('Symptom-check request received:', { symptoms });

    // Allow an optional Grok API key supplied in the request body for local/testing use.
    // If provided, it will be used for this single request only and not stored server-side.
    const grokKey = (req.body && req.body.grokKey) ? String(req.body.grokKey).trim() : process.env.GROK_API_KEY;

    if (!grokKey || grokKey === 'your_grok_api_key_here') {
      return res.json({ success: true, content: generateFallback(symptoms) });
    }

    const prompt = `You are a careful medical triage assistant. A user reports: "${symptoms}". Provide a short, clear, non-diagnostic response that:
1) Suggests likely non-emergency causes in plain language
2) Gives 3 practical self-care steps (no prescriptions)
3) Lists emergency warning signs that require immediate medical attention
Keep it concise and end with a safety disclaimer.`;

    const payload = {
      model: 'grok-2-latest',
      messages: [
        { role: 'system', content: 'You are a responsible medical triage assistant. Never give prescriptions. Prioritize safety.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.6
    };

    try {
      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${grokKey}`
          },
          timeout: 20000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) return res.json({ success: true, content: generateFallback(symptoms) });

      return res.json({ success: true, content });
    } catch (apiErr) {
      console.error('Grok symptom-check error:', apiErr.response?.data || apiErr.message);
      return res.json({ success: true, content: generateFallback(symptoms) });
    }
  } catch (err) {
    console.error('generateSymptomAI error:', err);
    // Return a safe fallback response instead of HTTP 500 so frontend can display a helpful message
    try {
      const body = req.body || {};
      const symptoms = body.symptoms || body || '';
      return res.json({ success: true, content: (typeof symptoms === 'string') ? generateFallback(symptoms) : generateFallback(String(symptoms)) });
    } catch (fallbackErr) {
      console.error('Fallback error in generateSymptomAI:', fallbackErr);
      return res.json({ success: true, content: 'Unable to analyze symptoms at the moment. Please try again later.' });
    }
  }
};

/* ---------------- STUDENT: GET ANONYMIZED MEDICAL RECORDS ---------------- */
export const getStudentMedicalRecords = async (req, res) => {
  try {
    // Get all completed appointments with their summaries
    const completedAppointments = await Appointment.find({ status: 'completed' })
      .populate('patient', 'age gender')
      .populate('doctor', 'name specialization')
      .sort({ date: -1 })
      .limit(100);

    // Get medical records
    const medicalRecords = await MedicalRecord.find({})
      .populate('patient', 'age gender')
      .populate('doctor', 'name specialization')
      .sort({ date: -1 })
      .limit(100);

    // Combine and anonymize data for students
    const records = [];
    let counter = 1001;

    // Add from completed appointments
    for (const apt of completedAppointments) {
      records.push({
        _id: apt._id,
        id: `PT-${counter++}`,
        patientAge: apt.patient?.age || Math.floor(Math.random() * 50) + 20,
        patientGender: apt.patient?.gender || 'Not specified',
        diagnosis: apt.reason || 'General Consultation',
        treatment: apt.summary ? apt.summary.substring(0, 100) + '...' : 'Treatment provided as per assessment',
        doctorName: apt.doctor?.name || apt.doctorName || 'Doctor',
        specialization: apt.doctor?.specialization || 'General',
        visitDate: apt.date,
        createdAt: apt.createdAt,
        status: 'Completed',
        summary: apt.summary || 'Consultation completed successfully.'
      });
    }

    // Add from medical records
    for (const rec of medicalRecords) {
      // Check if already added from appointment
      const exists = records.some(r => r.summary === rec.description);
      if (!exists) {
        records.push({
          _id: rec._id,
          id: `PT-${counter++}`,
          patientAge: rec.patient?.age || Math.floor(Math.random() * 50) + 20,
          patientGender: rec.patient?.gender || 'Not specified',
          diagnosis: rec.title || 'Medical Record',
          treatment: rec.description ? rec.description.substring(0, 100) + '...' : 'Treatment documented',
          doctorName: rec.doctor?.name || rec.doctorName || 'Doctor',
          specialization: rec.doctor?.specialization || 'General',
          visitDate: rec.date,
          createdAt: rec.createdAt,
          status: 'Documented',
          summary: rec.description || 'Medical record on file.',
          type: rec.type
        });
      }
    }

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------- STUDENT: AI LEARNING ASSISTANT (GROK) ---------------- */
export const aiLearningAssistant = async (req, res) => {
  try {
    const { message, context } = req.body;

    console.log('🤖 AI Learning request received:', message);

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Check if Grok API key is available
    if (!process.env.GROK_API_KEY || process.env.GROK_API_KEY === 'your_grok_api_key_here') {
      console.log('⚠️ Grok API key not configured, using fallback');
      return res.json({
        success: true,
        response: generateAILearningFallback(message)
      });
    }

    const systemPrompt = `You are an AI Medical Learning Assistant for medical students. Your role is to:
1. Answer the user's SPECIFIC question directly and accurately
2. Explain medical concepts clearly with proper terminology
3. Provide practical, actionable information
4. Help students understand diseases, symptoms, treatments, diet, and lifestyle
5. When asked about diet or food (like fruits), provide specific lists and recommendations

IMPORTANT: Answer the EXACT question asked. If asked about fruits to avoid in diabetes, list specific fruits, don't give a general diabetes overview.

Format your responses with:
- Use **bold** for important terms
- Use bullet points for lists
- Use ### for section headers
- Keep responses focused on the specific question asked

Current context: ${context || 'general medical education'}`;

    try {
      console.log('📡 Calling Grok API...');
      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: 'grok-2-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GROK_API_KEY}`
          },
          timeout: 30000
        }
      );

      console.log('✅ Grok API response received');
      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        console.log('⚠️ Empty response from Grok, using fallback');
        return res.json({
          success: true,
          response: generateAILearningFallback(message)
        });
      }

      return res.json({ success: true, response: content });
    } catch (apiErr) {
      console.error('❌ Grok AI Learning error:', apiErr.response?.data || apiErr.message);
      return res.json({
        success: true,
        response: generateAILearningFallback(message)
      });
    }
  } catch (err) {
    console.error('❌ aiLearningAssistant error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fallback responses for AI Learning when Grok API is unavailable
function generateAILearningFallback(query) {
  const lowerQuery = query.toLowerCase();

  // Handle specific fruit/diet questions for diabetes
  if (lowerQuery.includes('diabetes') && (lowerQuery.includes('fruit') || lowerQuery.includes('eat') || lowerQuery.includes('diet') || lowerQuery.includes('food'))) {
    return `## Fruits to Avoid or Limit in Diabetes 🍇

When managing diabetes, it's important to be mindful of fruit choices due to their sugar content.

### Fruits to AVOID or Eat in Very Small Amounts:
1. **Mango** - High glycemic index (GI: 51-56), very sweet
2. **Grapes** - High sugar content, easy to overeat
3. **Bananas (ripe)** - Higher GI when fully ripe (GI: 51-62)
4. **Pineapple** - High GI (66), spikes blood sugar quickly
5. **Watermelon** - High GI (72), although low carbs per serving
6. **Cherries** - High natural sugar content
7. **Dried fruits** - Concentrated sugar (dates, raisins, dried cranberries)
8. **Canned fruits in syrup** - Added sugars

### Better Fruit Choices for Diabetics:
- **Berries** (strawberries, blueberries, raspberries) - Low GI
- **Apples** - Good fiber, moderate GI
- **Pears** - High fiber, low GI
- **Citrus fruits** (oranges, grapefruit) - Lower GI
- **Kiwi** - Low GI, high fiber
- **Peaches** - Moderate GI when fresh

### Tips:
- Eat whole fruits, not fruit juices
- Pair fruits with protein or healthy fats
- Limit portions to 15g carbs per serving
- Check blood sugar response to different fruits

*Note: Individual responses may vary. Always monitor your blood sugar levels.*`;
  }

  if (lowerQuery.includes('diabetes')) {
    return `## Diabetes Overview

**Diabetes mellitus** is a metabolic disorder characterized by high blood sugar levels.

### Types:
1. **Type 1 Diabetes** - Autoimmune destruction of pancreatic beta cells
2. **Type 2 Diabetes** - Insulin resistance and relative insulin deficiency
3. **Gestational Diabetes** - Develops during pregnancy

### Common Symptoms:
- Increased thirst (polydipsia)
- Frequent urination (polyuria)
- Unexplained weight loss
- Fatigue and weakness
- Blurred vision
- Slow-healing wounds

### Diagnosis:
- Fasting blood glucose ≥126 mg/dL
- HbA1c ≥6.5%
- Random blood glucose ≥200 mg/dL with symptoms

Would you like me to explain more about treatment options or complications?`;
  }

  if (lowerQuery.includes('heart') || lowerQuery.includes('cardiac')) {
    return `## Heart Failure Stages

Heart failure is classified using the **NYHA (New York Heart Association)** classification:

### Stage I - Mild
- No limitation of physical activity
- Ordinary activity doesn't cause symptoms

### Stage II - Mild
- Slight limitation of physical activity
- Comfortable at rest, ordinary activity causes fatigue

### Stage III - Moderate
- Marked limitation of physical activity
- Less than ordinary activity causes symptoms

### Stage IV - Severe
- Unable to carry out any physical activity without discomfort
- Symptoms at rest

### Key Treatment Approaches:
- ACE inhibitors / ARBs
- Beta-blockers
- Diuretics
- Lifestyle modifications

Do you want me to elaborate on any specific stage or treatment?`;
  }

  if (lowerQuery.includes('anatomy') || lowerQuery.includes('quiz')) {
    return `## Anatomy Quiz 🎯

Let's test your knowledge! Here are some questions:

**Question 1:** Which organ is responsible for filtering blood and producing urine?
**Answer:** The **Kidneys** - They filter about 120-150 quarts of blood daily.

**Question 2:** How many bones are in the adult human body?
**Answer:** **206 bones** - Babies are born with about 270 bones that fuse together.

**Question 3:** What is the largest organ in the human body?
**Answer:** The **Skin** - It covers about 20 square feet in adults.

**Question 4:** Which chamber of the heart pumps blood to the lungs?
**Answer:** The **Right Ventricle** - It pumps deoxygenated blood to the lungs.

Would you like more quiz questions on a specific topic?`;
  }

  if (lowerQuery.includes('viral') || lowerQuery.includes('bacterial') || lowerQuery.includes('infection')) {
    return `## Viral vs Bacterial Infections

### Key Differences:

| Aspect | Viral | Bacterial |
|--------|-------|-----------|
| **Cause** | Viruses | Bacteria |
| **Size** | Smaller | Larger |
| **Treatment** | Antivirals (limited) | Antibiotics |
| **Examples** | Cold, Flu, COVID-19 | Strep throat, UTI |

### Viral Infections:
- Cannot be treated with antibiotics
- Often resolve on their own
- Antiviral medications for specific viruses
- Prevention through vaccines

### Bacterial Infections:
- Treated with antibiotics
- Can become antibiotic-resistant
- May require culture for proper treatment
- Prevention through hygiene and vaccines

### Clinical Clues:
- **Viral**: Clear runny nose, body aches, gradual onset
- **Bacterial**: Colored discharge, localized symptoms, may have fever

Need more details on specific infections?`;
  }

  // Default response
  return `Thank you for your question about "${query}".

As your AI Medical Learning Assistant, I can help you understand various medical topics.

### Topics I Can Help With:
- **Disease Pathophysiology** - How diseases develop and progress
- **Clinical Symptoms** - Signs and symptoms of various conditions
- **Diagnostic Criteria** - How conditions are diagnosed
- **Treatment Protocols** - Standard treatment approaches
- **Pharmacology** - Drug mechanisms and interactions
- **Anatomy & Physiology** - Body systems and functions

### Tips for Effective Learning:
1. Start with basic concepts before advancing
2. Use clinical case studies for practical application
3. Create flashcards for key terms
4. Practice with quizzes regularly

Feel free to ask specific questions about any medical topic, and I'll provide detailed explanations!

**Note:** AI responses are for educational purposes only. Always consult medical professionals for real clinical decisions.`;
}

/* ---------------- STUDENT: CHAT HISTORY FUNCTIONS ---------------- */

// Get all chat histories for current user
export const getChatHistories = async (req, res) => {
  try {
    const chats = await ChatHistory.find({ user: req.user._id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });
    
    res.json({ success: true, data: chats });
  } catch (err) {
    console.error('getChatHistories error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single chat history
export const getChatHistory = async (req, res) => {
  try {
    const chat = await ChatHistory.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    res.json({ success: true, data: chat });
  } catch (err) {
    console.error('getChatHistory error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create new chat
export const createChatHistory = async (req, res) => {
  try {
    const chat = await ChatHistory.create({
      user: req.user._id,
      title: 'New Chat',
      messages: []
    });
    
    res.status(201).json({ success: true, data: chat });
  } catch (err) {
    console.error('createChatHistory error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add message to chat and get AI response
export const addMessageToChat = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    let chat;
    
    // If chatId provided, find existing chat, otherwise create new one
    if (chatId) {
      chat = await ChatHistory.findOne({ _id: chatId, user: req.user._id });
      if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found' });
      }
    } else {
      chat = await ChatHistory.create({
        user: req.user._id,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: []
      });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Get AI response
    let aiResponse;
    
    if (process.env.GROK_API_KEY && process.env.GROK_API_KEY !== 'your_grok_api_key_here') {
      try {
        console.log('📡 Calling Grok API for chat...');
        const response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          {
            model: 'grok-2-latest',
            messages: [
              { 
                role: 'system', 
                content: `You are an AI Medical Learning Assistant for medical students. Answer questions accurately and specifically. Format responses with markdown.` 
              },
              ...chat.messages.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.7,
            max_tokens: 1500
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.GROK_API_KEY}`
            },
            timeout: 30000
          }
        );
        
        aiResponse = response.data?.choices?.[0]?.message?.content || generateAILearningFallback(message);
      } catch (apiErr) {
        console.error('❌ Grok API error:', apiErr.message);
        aiResponse = generateAILearningFallback(message);
      }
    } else {
      aiResponse = generateAILearningFallback(message);
    }

    // Add AI response
    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    // Update title if first message
    if (chat.messages.filter(m => m.role === 'user').length === 1) {
      chat.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
    }

    await chat.save();

    res.json({ 
      success: true, 
      data: {
        chatId: chat._id,
        response: aiResponse,
        chat: chat
      }
    });
  } catch (err) {
    console.error('addMessageToChat error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete chat history
export const deleteChatHistory = async (req, res) => {
  try {
    const chat = await ChatHistory.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (err) {
    console.error('deleteChatHistory error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------- DOCTOR: STUDENT MANAGEMENT & ASSIGNMENTS ---------------- */

// Get all students (for doctor)
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email profilePicture createdAt')
      .sort({ createdAt: -1 });

    // Get assignment count for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const totalAssignments = await Assignment.countDocuments({ 
          student: student._id,
          doctor: req.user._id 
        });
        const completedAssignments = await Assignment.countDocuments({ 
          student: student._id,
          doctor: req.user._id,
          status: 'completed'
        });
        const pendingAssignments = await Assignment.countDocuments({ 
          student: student._id,
          doctor: req.user._id,
          status: { $in: ['pending', 'in-progress'] }
        });

        return {
          ...student.toObject(),
          totalAssignments,
          completedAssignments,
          pendingAssignments
        };
      })
    );

    res.json({ success: true, data: studentsWithStats });
  } catch (err) {
    console.error('getAllStudents error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get assignments created by doctor
export const getDoctorAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ doctor: req.user._id })
      .populate('student', 'name email profilePicture')
      .populate('medicalRecord', 'diagnosis treatment')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: assignments });
  } catch (err) {
    console.error('getDoctorAssignments error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create assignment for student
export const createAssignment = async (req, res) => {
  try {
    const { studentId, title, description, type, dueDate, medicalRecordId } = req.body;

    if (!studentId || !title || !description || !dueDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student, title, description, and due date are required' 
      });
    }

    // Verify student exists
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      type: type || 'case-study',
      doctor: req.user._id,
      student: studentId,
      medicalRecord: medicalRecordId || null,
      dueDate: new Date(dueDate),
      status: 'pending'
    });

    // Create notification for student
    await Notification.create({
      user: studentId,
      title: 'New Assignment',
      message: `Dr. ${req.user.name} has assigned you: ${title}`,
      type: 'assignment'
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('student', 'name email')
      .populate('medicalRecord', 'diagnosis');

    res.status(201).json({ success: true, data: populatedAssignment });
  } catch (err) {
    console.error('createAssignment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update assignment
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const assignment = await Assignment.findOneAndUpdate(
      { _id: id, doctor: req.user._id },
      { ...updates, updatedAt: Date.now() },
      { new: true }
    ).populate('student', 'name email');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.json({ success: true, data: assignment });
  } catch (err) {
    console.error('updateAssignment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findOneAndDelete({ 
      _id: id, 
      doctor: req.user._id 
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('deleteAssignment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get assignments for student
export const getStudentAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ student: req.user._id })
      .populate('doctor', 'name email specialization')
      .populate('medicalRecord', 'diagnosis treatment patientAge patientGender')
      .sort({ dueDate: 1 });

    res.json({ success: true, data: assignments });
  } catch (err) {
    console.error('getStudentAssignments error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Submit assignment response (for student)
export const submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const assignment = await Assignment.findOneAndUpdate(
      { _id: id, student: req.user._id },
      { 
        studentResponse: response, 
        status: 'submitted',
        submittedAt: Date.now(),
        updatedAt: Date.now() 
      },
      { new: true }
    ).populate('doctor', 'name');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Notify doctor
    await Notification.create({
      user: assignment.doctor._id,
      title: 'Assignment Submitted',
      message: `${req.user.name} has submitted: ${assignment.title}`,
      type: 'assignment'
    });

    res.json({ success: true, data: assignment });
  } catch (err) {
    console.error('submitAssignment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Grade assignment (for doctor)
export const gradeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, grade } = req.body;

    const assignment = await Assignment.findOneAndUpdate(
      { _id: id, doctor: req.user._id },
      { 
        feedback, 
        grade,
        status: 'completed',
        updatedAt: Date.now() 
      },
      { new: true }
    ).populate('student', 'name');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Notify student
    await Notification.create({
      user: assignment.student._id,
      title: 'Assignment Graded',
      message: `Your assignment "${assignment.title}" has been graded: ${grade}`,
      type: 'assignment'
    });

    res.json({ success: true, data: assignment });
  } catch (err) {
    console.error('gradeAssignment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------- STUDENT-DOCTOR SELECTION ---------------- */

// Student: Select a doctor
export const selectDoctor = async (req, res) => {
  try {
    const { doctorId, message } = req.body;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Doctor ID is required' });
    }

    // Check if doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check if already selected
    const existing = await StudentDoctorSelection.findOne({
      student: req.user._id,
      doctor: doctorId
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already selected this doctor' });
    }

    // Create selection
    const selection = await StudentDoctorSelection.create({
      student: req.user._id,
      doctor: doctorId,
      message: message || '',
      status: 'pending'
    });

    // Notify doctor
    await Notification.create({
      user: doctorId,
      title: 'New Student Request',
      message: `${req.user.name} wants to learn under your guidance`,
      type: 'student_request'
    });

    res.status(201).json({ success: true, data: selection, message: 'Request sent to doctor' });
  } catch (err) {
    console.error('selectDoctor error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Student: Get my selected doctors
export const getMySelectedDoctors = async (req, res) => {
  try {
    const selections = await StudentDoctorSelection.find({ student: req.user._id })
      .populate('doctor', 'name email specialization profilePicture')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: selections });
  } catch (err) {
    console.error('getMySelectedDoctors error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Student: Cancel selection
export const cancelDoctorSelection = async (req, res) => {
  try {
    const { id } = req.params;

    const selection = await StudentDoctorSelection.findOneAndDelete({
      _id: id,
      student: req.user._id
    });

    if (!selection) {
      return res.status(404).json({ success: false, message: 'Selection not found' });
    }

    res.json({ success: true, message: 'Selection cancelled' });
  } catch (err) {
    console.error('cancelDoctorSelection error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Doctor: Get students who selected me
export const getMyStudents = async (req, res) => {
  try {
    const selections = await StudentDoctorSelection.find({ 
      doctor: req.user._id,
      status: { $in: ['pending', 'accepted'] }
    })
      .populate('student', 'name email profilePicture createdAt')
      .sort({ createdAt: -1 });

    // Get assignment stats for each student
    const studentsWithStats = await Promise.all(
      selections.map(async (sel) => {
        const totalAssignments = await Assignment.countDocuments({ 
          student: sel.student._id,
          doctor: req.user._id 
        });
        const completedAssignments = await Assignment.countDocuments({ 
          student: sel.student._id,
          doctor: req.user._id,
          status: 'completed'
        });
        const pendingAssignments = await Assignment.countDocuments({ 
          student: sel.student._id,
          doctor: req.user._id,
          status: { $in: ['pending', 'in-progress'] }
        });

        return {
          _id: sel.student._id,
          name: sel.student.name,
          email: sel.student.email,
          profilePicture: sel.student.profilePicture,
          createdAt: sel.student.createdAt,
          selectionStatus: sel.status,
          selectionId: sel._id,
          selectionMessage: sel.message,
          selectedAt: sel.createdAt,
          totalAssignments,
          completedAssignments,
          pendingAssignments
        };
      })
    );

    res.json({ success: true, data: studentsWithStats });
  } catch (err) {
    console.error('getMyStudents error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Doctor: Accept/Reject student selection
export const updateStudentSelection = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const selection = await StudentDoctorSelection.findOneAndUpdate(
      { _id: id, doctor: req.user._id },
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('student', 'name');

    if (!selection) {
      return res.status(404).json({ success: false, message: 'Selection not found' });
    }

    // Notify student
    await Notification.create({
      user: selection.student._id,
      title: status === 'accepted' ? 'Request Accepted' : 'Request Declined',
      message: status === 'accepted' 
        ? `Dr. ${req.user.name} has accepted your learning request!`
        : `Dr. ${req.user.name} has declined your request`,
      type: 'student_request'
    });

    res.json({ success: true, data: selection });
  } catch (err) {
    console.error('updateStudentSelection error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
