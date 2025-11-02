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
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// CORS configuration
const allowedOrigins = [
  'https://mediconnect-in.onrender.com',
  'http://localhost:5173',
  'https://mediconnect-sign-up-in2.onrender.com',
  'https://mediconnect-frontend.onrender.com', // Add your frontend URL here
  'http://localhost:3000' // Common React development port
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
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

// Test endpoint to check MongoDB connection and database operations
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

    // Try to count users
    const userCount = await User.countDocuments();
    
    // Try to find one user
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
setupSocket(io);

// Connect to MongoDB with proper configuration
const connectDB = async () => {
  try {
    if (!process.env.DB_URI) {
      throw new Error('DB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.DB_URI, {
      // Connection options for better reliability
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB connected successfully!`);
    console.log(`📍 Database: ${conn.connection.name}`);
    console.log(`🔗 Host: ${conn.connection.host}`);
    
    // Handle MongoDB connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('💡 Please check:');
    console.error('   1. MongoDB is running');
    console.error('   2. DB_URI is correct in .env file');
    console.error('   3. Network connectivity');
    process.exit(1);
  }
};

// Start server only after MongoDB is connected
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Start server after successful connection
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();


