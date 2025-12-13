import { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const SymptomChecker = () => {
  const { authToken } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Symptom Checker. Please describe your symptoms in detail and I\'ll try to help.\n\n*Note: This is not a substitute for professional medical advice.*'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseLanguage, setResponseLanguage] = useState('en'); // 'en' or 'hi'
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to detect if text contains Hindi/Devanagari characters
  const isHindi = (text) => {
    return /[\u0900-\u097F]/.test(text);
  };

  const analyzeSymptoms = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage = { 
      role: 'user', 
      content: input,
      language: isHindi(input) ? 'hi' : 'en'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/analyze-symptoms',
        {
          symptoms: [input],
          age: 30, // Can be dynamic based on user profile
          gender: 'unknown', // Can be dynamic based on user profile
          medicalHistory: '', // Can be added from user profile
          language: userMessage.language
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      // Add AI response to messages
      setMessages(prev => [
        ...prev, 
        {
          role: 'assistant',
          content: response.data.analysis || (userMessage.language === 'hi' 
            ? 'मैं आपके लक्षणों का विश्लेषण नहीं कर पाया। कृपया पुनः प्रयास करें।' 
            : 'I couldn\'t analyze the symptoms. Please try again.')
        }
      ]);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      
      // Show error message in appropriate language
      const errorMessage = userMessage.language === 'hi'
        ? 'माफ़ कीजिए, आपके लक्षणों का विश्लेषण करते समय एक त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।'
        : 'Sorry, there was an error analyzing your symptoms. Please try again later.';
      
      setMessages(prev => [
        ...prev, 
        {
          role: 'assistant',
          content: errorMessage
        }
      ]);
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">AI Symptom Checker</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <button
              onClick={() => setResponseLanguage(prev => prev === 'en' ? 'hi' : 'en')}
              className="px-3 py-1 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors whitespace-nowrap"
            >
              {responseLanguage === 'en' ? 'हिंदी में प्रतिक्रिया दें' : 'Get Response in English'}
            </button>
            <div className="px-3 py-1 text-xs sm:text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full whitespace-nowrap">
              Beta
            </div>
          </div>
        </div>
        
        {/* Chat Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[calc(100vh-220px)] sm:h-[70vh] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] sm:max-w-3xl rounded-lg p-3 sm:p-4 text-sm sm:text-base ${
                    message.role === 'user' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <div className="bg-blue-500 p-1 rounded-full">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="bg-gray-500 p-1 rounded-full">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="whitespace-pre-line">
                      {message.content.split('*').map((part, i) => 
                        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <form onSubmit={analyzeSymptoms} className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your symptoms..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 sm:p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 text-center px-1">
              This AI symptom checker is for informational purposes only and not a substitute for professional medical advice.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
