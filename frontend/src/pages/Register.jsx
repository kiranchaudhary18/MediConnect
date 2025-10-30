import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const [role, setRole] = useState('patient')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    year: '',
    age: '',
    gender: '',
    contact: '',
    bio: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Prepare data - remove empty strings and confirmPassword
      const { confirmPassword, ...submitData } = formData
      const cleanedData = Object.fromEntries(
        Object.entries(submitData).filter(([_, value]) => value !== '')
      )
      
      const result = await register({ ...cleanedData, role })
      if (result.success) {
        navigate(`/${result.user.role}/dashboard`)
      } else {
        setError(result.message || 'Registration failed')
      }
    } catch (err) {
      setError('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('') // Clear error when user types
  }

  // Animation variants for form steps
  const formVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  // Handle next step
  const nextStep = () => {
    // Basic validation for step 1
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      setError('');
    }
    setStep(step + 1);
  };

  // Handle previous step
  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  // Handle role selection
  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  // Role options
  const roles = [
    { id: 'patient', icon: <User className="h-5 w-5" />, label: 'Patient', description: 'Book appointments and manage your health' },
    { id: 'doctor', icon: <Stethoscope className="h-5 w-5" />, label: 'Doctor', description: 'Manage patients and appointments' },
    { id: 'student', icon: <User className="h-5 w-5" />, label: 'Student', description: 'Access learning resources and track progress' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Create Your Account</h1>
            <p className="mt-2 text-blue-50">Join MediConnect to get started</p>
            
            {/* Progress Steps */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div 
                      className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                        step >= stepNumber 
                          ? 'bg-white text-blue-600 border-white scale-110' 
                          : 'border-blue-200 text-blue-100'
                      } font-medium text-sm`}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`h-1 w-12 mx-2 transition-all duration-300 ${
                        step > stepNumber ? 'bg-white' : 'bg-blue-200/50'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 text-blue-100 text-sm">
              {step === 1 && 'Account Information'}
              {step === 2 && 'Personal Details'}
              {step === 3 && 'Complete Profile'}
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r dark:bg-red-900 dark:border-red-700 dark:text-red-100"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait" custom={step}>
                <motion.div
                  key={step}
                  custom={step}
                  variants={formVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'tween', ease: 'easeInOut' }}
                  className="space-y-6"
                >
              
                 

                

              
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">I am a...</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {roles.map((roleItem) => (
                        <motion.div
                          key={roleItem.id}
                          whileHover={{ y: -2 }}
                          onClick={() => selectRole(roleItem.id)}
                          className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            role === roleItem.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              role === roleItem.id 
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-800/50 dark:text-blue-300' 
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {roleItem.icon}
                            </div>
                            <h3 className={`font-medium ${
                              role === roleItem.id 
                                ? 'text-blue-700 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {roleItem.label}
                            </h3>
                          </div>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {roleItem.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="space-y-4 mt-8">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">Account Information</h3>
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
                            placeholder="Full name"
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
                            placeholder="Email address"
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
                            placeholder="Create password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                            )}
                          </button>
                        </div>

                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
                            placeholder="Confirm password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Details */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Personal Details</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Age <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="age"
                          name="age"
                          type="number"
                          min="1"
                          required
                          value={formData.age}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
                          placeholder="Your age"
                        />
                      </div>

                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="gender"
                            name="gender"
                            required
                            value={formData.gender}
                            onChange={handleChange}
                            className="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 pr-10"
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact"
                        name="contact"
                        type="tel"
                        required
                        value={formData.contact}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
                        placeholder="Your contact number"
                      />
                    </div>

                    {role === 'doctor' && (
                      <div>
                        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Specialization <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="specialization"
                          name="specialization"
                          type="text"
                          required
                          value={formData.specialization}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
                          placeholder="e.g., Cardiologist, Pediatrician"
                        />
                      </div>
                    )}

                    {role === 'student' && (
                      <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Year of Study <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="year"
                            name="year"
                            required
                            value={formData.year}
                            onChange={handleChange}
                            className="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 pr-10"
                          >
                            <option value="">Select year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                            <option value="5">5th Year+</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Complete Profile */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Complete Your Profile</h2>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {role === 'doctor' ? 'Professional Bio' : 'Tell us about yourself'} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows="4"
                        required
                        value={formData.bio}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
                        placeholder={
                          role === 'doctor' 
                            ? 'Your professional background, expertise, and qualifications...' 
                            : 'A little bit about yourself, your interests, and what brings you here...'
                        }
                      ></textarea>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        This will be visible on your profile. {role === 'doctor' ? 'Minimum 50 characters.' : ''}
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Account Type: <span className="capitalize">{role}</span>
                      </h3>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {role === 'doctor' 
                          ? 'As a doctor, you\'ll be able to manage appointments, view patient records, and provide consultations.'
                          : role === 'student'
                          ? 'As a student, you\'ll have access to learning resources, track your progress, and connect with mentors.'
                          : 'As a patient, you can book appointments, view your medical history, and chat with healthcare providers.'
                        }
                      </p>
                    </div>
                  </div>
                )}

                  {/* Navigation Buttons */}
                  <div className={`mt-8 flex ${step === 1 ? 'justify-end' : 'justify-between'}`}>
                    {step > 1 ? (
                      <div className="flex justify-between w-full">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                        >
                          Back
                        </button>
                        {step === 3 ? (
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Creating Account...' : 'Complete Registration'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={nextStep}
                            className="px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                          >
                            Next
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full">
                        <button
                          type="button"
                          onClick={nextStep}
                          className="w-full md:w-auto px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md flex items-center justify-center space-x-2"
                        >
                          <span>Continue</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
                          Already have an account?{' '}
                          <Link to="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                            Sign in
                          </Link>
                        </p>
                        <div className="relative mt-6">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                              OR
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/')}
                          className="w-full mt-6 px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                        >
                          Continue as Guest
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
