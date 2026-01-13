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
