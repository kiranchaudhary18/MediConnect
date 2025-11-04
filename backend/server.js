import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import doctorRoutes from './routes/doctor.js';
import patientRoutes from './routes/patient.js';
import studentRoutes from './routes/student.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import { setupSocket } from './socket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Allowed frontend origins
const allowedOrigins = [
  'https://mediconnect-in.onrender.com',  // deployed frontend
  'http://localhost:5173',                // local frontend
  'https://mediconnect-sign-up-in2.onrender.com',
  'https://mediconnect-frontend.onrender.com',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

// CORS middleware
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / curl / mobile apps
    if (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    console.log('Blocked CORS request from:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS before all routes
app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({ 
    status: 'OK', 
    message: 'MediConnect API is running',
    database: {
      status: dbStatusText[dbStatus] || 'unknown',
      connected: dbStatus === 1,
      name: mongoose.connection.name,
      host: mongoose.connection.host
    }
  });
});

// Test MongoDB connection
app.get('/api/test/db', async (req, res) => {
  try {
    const User = (await import('./models/User.js')).default;

    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1;

    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB not connected',
        connectionState: dbState
      });
    }

    const userCount = await User.countDocuments();
    const sampleUser = await User.findOne().select('name email role').lean();

    res.json({
      success: true,
      message: 'Database connection working',
      database: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        state: 'connected'
      },
      collection: {
        name: User.collection.name,
        userCount: userCount
      },
      users: {
        count: userCount,
        sample: sampleUser || 'No users found'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});
setupSocket(io);

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.DB_URI) throw new Error('DB_URI is not defined in environment variables');

    const conn = await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB connected! Database: ${conn.connection.name}, Host: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err));
    mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected. Reconnecting...'));
    mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Start server after MongoDB connects
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
