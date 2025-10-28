# MediConnect - Healthcare Platform

A comprehensive full-stack healthcare platform connecting Patients, Doctors, and Medical Students.

## 🚀 Features

### 🔐 Authentication
- JWT-based authentication with role-based access control
- Password hashing using bcrypt
- Login/Logout functionality for all user roles

### 👨‍⚕️ Doctor Module
- Dashboard with statistics (patients, students, appointments)
- Manage patient records
- Approve/reject appointments
- Assign students to patients
- Create and send prescriptions
- Real-time chat with patients and students

### 👨‍🎓 Student Module
- View assigned patients and doctors
- Submit case studies
- Access doctor's notes
- Chat with doctors

### 🧑‍🤝‍🧑 Patient Module
- View and book appointments with doctors
- Upload health reports
- View prescriptions
- Real-time chat with doctors

### 🎯 Additional Features
- AI Symptom Checker (integratable with AI APIs)
- Dark/Light mode toggle
- Real-time chat with Socket.io
- Health analytics dashboard
- Notification system (ready for email integration)

## 🛠️ Technology Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcrypt for authentication
- Socket.io for real-time chat
- Cloudinary for file uploads
- Multer for file handling

### Frontend
- React (Vite)
- Tailwind CSS
- React Router DOM
- Context API for state management
- Socket.io Client
- Recharts for analytics
- Lucide React for icons

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
DB_URI=mongodb://localhost:27017/mediconnect
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GEMINI_API_KEY=your_gemini_api_key_optional
```

4. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🗂️ Project Structure

```
MediConnect/
├── backend/
│   ├── config/
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   ├── studentController.js
│   │   ├── adminController.js
│   │   └── chatController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   ├── Prescription.js
│   │   ├── Message.js
│   │   ├── CaseStudy.js
│   │   ├── HealthReport.js
│   │   └── PatientAssignment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── doctor.js
│   │   ├── patient.js
│   │   ├── student.js
│   │   ├── admin.js
│   │   └── chat.js
│   ├── socket.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── SymptomChecker.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🔑 API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Doctor Routes
- `GET /api/doctor/dashboard` - Get dashboard data
- `GET /api/doctor/patients` - Get all patients
- `POST /api/doctor/patient` - Create patient
- `PUT /api/doctor/patient/:id` - Update patient
- `GET /api/doctor/appointments` - Get appointments
- `PUT /api/doctor/appointment/:id` - Update appointment
- `POST /api/doctor/prescription` - Create prescription
- `GET /api/doctor/students` - Get students
- `POST /api/doctor/assign-student` - Assign student to patient

### Patient Routes
- `GET /api/patient/doctors` - Get all doctors
- `POST /api/patient/appointment` - Book appointment
- `GET /api/patient/appointments` - Get appointments
- `GET /api/patient/prescriptions` - Get prescriptions
- `POST /api/patient/upload-report` - Upload health report

### Student Routes
- `GET /api/student/dashboard` - Get dashboard
- `GET /api/student/assigned` - Get assigned patients
- `POST /api/student/case-study` - Submit case study

### Chat Routes
- `GET /api/chat/:conversationId` - Get messages
- `GET /api/chat` - Get conversations

## 🎨 Features in Detail

### Real-time Chat
- Socket.io integration for instant messaging
- Online/offline status indicators
- Typing indicators
- Chat history persistence

### File Uploads
- Cloudinary integration for health reports
- Support for PDF and image files
- Secure file storage

### Dark Mode
- Toggle between light and dark themes
- Persists user preference in localStorage
- Tailwind dark mode support

## 🚢 Deployment

### Backend
- Deploy to Render, Railway, or Heroku
- Set environment variables
- MongoDB Atlas for database

### Frontend
- Deploy to Vercel or Netlify
- Update API endpoint in SocketContext
- Build command: `npm run build`

## 📝 Notes
- Create an admin user manually in MongoDB
- Update Cloudinary credentials in backend `.env`
- Socket.io server runs on the same port as Express
- All sensitive operations are protected with JWT middleware

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is open source and available under the MIT License.

## 👨‍💻 Author
MediConnect Development Team

---

**Made with ❤️ for healthcare**

