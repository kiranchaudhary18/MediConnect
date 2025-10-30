import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';

const activeUsers = new Map();

export const setupSocket = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Add user to active users
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      role: socket.userRole
    });

    // Emit online status to all clients
    io.emit('user-online', socket.userId);

    // Join user to their personal room
    socket.join(`user-${socket.userId}`);

    // Get conversations
    socket.on('get-conversations', async () => {
      try {
        const conversations = await Message.find({
          $or: [
            { senderId: socket.userId },
            { receiverId: socket.userId }
          ]
        })
        .populate('senderId', 'name profilePicture')
        .populate('receiverId', 'name profilePicture')
        .sort({ createdAt: -1 });

        socket.emit('conversations', conversations);
      } catch (error) {
        socket.emit('error', { message: 'Failed to load conversations' });
      }
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { receiverId, message } = data;
        const conversationId = Message.getConversationId(socket.userId, receiverId);

        const newMessage = await Message.create({
          senderId: socket.userId,
          receiverId,
          message,
          conversationId
        });

        // Populate message
        await newMessage.populate('senderId', 'name profilePicture');
        await newMessage.populate('receiverId', 'name profilePicture');

        // Send to receiver
        io.to(`user-${receiverId}`).emit('receive-message', newMessage);
        
        // Send confirmation to sender
        socket.emit('message-sent', newMessage);

        // Update conversation list
        io.to(`user-${socket.userId}`).emit('conversation-updated', newMessage);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Join conversation room
    socket.on('join-conversation', async (conversationId) => {
      socket.join(`conversation-${conversationId}`);
    });

    // User typing
    socket.on('typing', (data) => {
      socket.to(`user-${data.receiverId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: data.isTyping
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      activeUsers.delete(socket.userId);
      io.emit('user-offline', socket.userId);
    });
  });
};

