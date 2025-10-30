import Message from '../models/Message.js';
import User from '../models/User.js';

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const conversations = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
    .populate('senderId', 'name profilePicture')
    .populate('receiverId', 'name profilePicture')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


