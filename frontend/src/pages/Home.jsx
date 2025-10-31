import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AISymptomChecker from '../components/AISymptomChecker'
import { Heart, Users, GraduationCap, Shield, Stethoscope, Calendar, MessageSquare, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const Home = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6"
            >
              Transforming Healthcare <span className="text-orange-400">Together</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-blue-100 max-w-3xl mx-auto mb-8"
            >
              Connect with top medical professionals, access quality care, and advance your medical education all in one platform.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center px-4"
            >
              <Link
                to="/register"
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Login</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent"></div>
      </section>

      {/* AI Symptom Checker */}
      <AISymptomChecker />

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 text-sm font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/30 rounded-full mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              A Better Healthcare Experience
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're revolutionizing healthcare by connecting patients, doctors, and students in one seamless platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Calendar, 
                title: 'Easy Appointments', 
                desc: 'Book and manage your medical appointments with just a few clicks, 24/7 access to schedule at your convenience.'
              },
              { 
                icon: Stethoscope, 
                title: 'Expert Doctors', 
                desc: 'Connect with board-certified healthcare professionals across various specialties for comprehensive care.'
              },
              { 
                icon: MessageSquare, 
                title: 'Seamless Communication', 
                desc: 'Chat securely with your healthcare providers, ask questions, and get timely responses.'
              },
              { 
                icon: GraduationCap, 
                title: 'Medical Education', 
                desc: 'Students can learn from real cases and experienced doctors in an interactive environment.'
              },
              { 
                icon: Shield, 
                title: 'Secure & Private', 
                desc: 'Your health data is protected with bank-level encryption and strict privacy controls.'
              },
              { 
                icon: Clock, 
                title: 'Save Time', 
                desc: 'Reduce waiting times and get the care you need when you need it with our efficient platform.'
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
                  <feature.icon className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 md:mb-8 dark:text-white px-4">About MediConnect</h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center px-4">
            MediConnect is a comprehensive healthcare platform that bridges the gap between patients, doctors, 
            and medical students. Our platform enables seamless communication, appointment management, and 
            educational collaboration in the medical field.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 MediConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home


