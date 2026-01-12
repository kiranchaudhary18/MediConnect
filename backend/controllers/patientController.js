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



import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
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

    const apt = await Appointment.findOneAndUpdate(
      { _id: id, doctor: req.user._id },
      { status },
      { new: true }
    ).populate('patient', 'name email');

    if (!apt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ success: true, appointment: apt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('_id name specialization experience profilePicture');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
