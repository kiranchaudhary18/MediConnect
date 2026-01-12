// import express from 'express';
// import { register, login, getMe, logout, refreshToken, updateProfile } from '../controllers/authController.js';
// import { protect } from '../middleware/auth.js';

// const router = express.Router();

// // Public routes
// router.post('/register', register);
// router.post('/login', login);

// // Protected routes
// router.get('/me', protect, getMe);
// router.post('/logout', protect, logout);
// router.post('/refresh', refreshToken);
// // Get the upload middleware from app.locals
// const upload = (req, res, next) => {
//   req.app.locals.upload.single('photo')(req, res, function (err) {
//     if (err) {
//       return res.status(400).json({
//         success: false,
//         message: err.message
//       });
//     }
//     next();
//   });
// };

// router.put('/profile', protect, upload, updateProfile);


// export default router;



// import express from 'express';
// import {
//   register,
//   login,
//   getMe,
//   logout,
//   refreshToken,
//   updateProfile
// } from '../controllers/authController.js';
// import { protect } from '../middleware/auth.js';
// import { upload } from '../middleware/upload.js';

// const router = express.Router();

// // Public
// router.post('/register', register);
// router.post('/login', login);

// // Protected
// router.get('/me', protect, getMe);
// router.post('/logout', protect, logout);
// router.post('/refresh', refreshToken);

// // ✅ FIXED PROFILE ROUTE
// router.put(
//   '/profile',
//   protect,
//   upload.single('photo'),   // 🔥 SAME NAME EVERYWHERE
//   updateProfile
// );

// export default router;


import express from 'express';
import { register, login, getMe, logout, refreshToken, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);

// ✅ IMPORTANT
router.put(
  '/profile',
  protect,
  upload.single('photo'),   // 👈 SAME NAME AS FRONTEND
  updateProfile
);

export default router;
