import express from 'express';
import { register, login, getMe, logout, refreshToken, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
// Get the upload middleware from app.locals
const upload = (req, res, next) => {
  req.app.locals.upload.single('image')(req, res, function(err) {
    if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    next();
  });
};

// Update profile with file upload
router.put('/profile', protect, upload, updateProfile);

export default router;
