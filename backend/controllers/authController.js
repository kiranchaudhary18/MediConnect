import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected. Cannot register user.');
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.' 
      });
    }

    const { name, email, password, role, specialization, year, age, gender, contact, bio } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Validate role
    if (!['patient', 'doctor', 'student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    console.log(`📝 Registration attempt for: ${email} (Role: ${role})`);

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.log(`⚠️ User already exists: ${email}`);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Prepare user data - only include fields with values
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role
    };

    // Add optional fields only if they have values
    if (specialization && specialization.trim()) {
      userData.specialization = specialization.trim();
    }
    if (year && !isNaN(year)) {
      userData.year = parseInt(year);
    }
    if (age && !isNaN(age)) {
      userData.age = parseInt(age);
    }
    if (gender && ['male', 'female', 'other'].includes(gender.trim())) {
      userData.gender = gender.trim();
    }
    if (contact && contact.trim()) {
      userData.contact = contact.trim();
    }
    if (bio && bio.trim()) {
      userData.bio = bio.trim();
    }

    // Create user
    console.log('💾 Saving user to database...');
    console.log('📊 Database Name:', mongoose.connection.name);
    console.log('📊 Collection:', User.collection.name);
    console.log('📊 User Data:', JSON.stringify(userData, null, 2));
    
    const user = await User.create(userData);
    
    console.log(`✅ User created successfully!`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Collection: ${User.collection.name}`);
    
    // Verify user was saved
    const verifyUser = await User.findById(user._id);
    if (!verifyUser) {
      console.error('⚠️ WARNING: User not found after creation!');
    } else {
      console.log('✅ User verified in database');
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        year: user.year,
        age: user.age,
        gender: user.gender,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    const errorMessage = error.message || 'Server error during registration';
    
    // If validation error, send specific message
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // If duplicate key error (email already exists)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // If MongoDB connection error
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerError') {
      console.error('💥 MongoDB error:', error.message);
      return res.status(503).json({ message: 'Database error. Please try again later.' });
    }
    
    res.status(500).json({ message: errorMessage });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    console.log('Login attempt for email:', email);

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', user.name, 'Role:', user.role);

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        year: user.year,
        age: user.age,
        gender: user.gender,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req, res) => {
  try {
    // JWT is stateless, so we just send success message
    // In production, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    const newToken = generateToken(user._id);
    
    res.json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        year: user.year,
        age: user.age,
        gender: user.gender,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
