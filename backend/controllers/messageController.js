import Message from '../models/Message.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// Get all patients who have had appointments with this doctor (for starting new chats)
export const getMyPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    // Get unique patients from appointments
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'name email photoURL role');
    
    const patientsMap = {};
    appointments.forEach((apt) => {
      if (apt.patient && apt.patient._id) {
        patientsMap[apt.patient._id] = apt.patient;
      }
    });
    
    // Also get patients registered in system with role 'patient'
    const allPatients = await User.find({ role: 'patient' }).select('name email photoURL role');
    allPatients.forEach((p) => {
      if (!patientsMap[p._id]) {
        patientsMap[p._id] = p;
      }
    });
    
    res.json(Object.values(patientsMap));
  } catch (err) {
    res.status(500).json({ message: 'Failed to load patients' });
  }
};

// Get all doctors (for patients starting new chats)
export const getMyDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('name email photoURL role specialization');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load doctors' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get unique conversation partners
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate('senderId', 'name email photoURL role')
      .populate('receiverId', 'name email photoURL role')
      .sort({ createdAt: -1 });

    // Build conversation map with latest message
    const conversations = {};
    messages.forEach((msg) => {
      const partnerId = msg.senderId._id.equals(userId) ? msg.receiverId._id : msg.senderId._id;
      const partner = msg.senderId._id.equals(userId) ? msg.receiverId : msg.senderId;

      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          partner,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: msg.senderId._id.equals(userId) ? 0 : !msg.read ? 1 : 0,
        };
      } else if (!msg.read && !msg.senderId._id.equals(userId)) {
        conversations[partnerId].unreadCount += 1;
      }
    });

    const result = Object.values(conversations);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load conversations' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    })
      .populate('senderId', 'name email photoURL role')
      .populate('receiverId', 'name email photoURL role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    await newMessage.populate('senderId', 'name email photoURL role');
    await newMessage.populate('receiverId', 'name email photoURL role');

    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(messageId, { read: true }, { new: true });

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Find the message and check if the user is the sender
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete message' });
  }
};
