import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react';

const SymptomChecker = () => {
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

  const analyzeSymptoms = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message with language preference
    const userMessage = { 
      role: 'user', 
      content: input,
      language: responseLanguage
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Check if input is in Hindi
    const isHindiInput = isHindi(input);
    const symptoms = input.toLowerCase();

    // Simulate API call delay
    setTimeout(() => {
      try {
        let conditions = [];
        let recommendations = [];

        // Simple symptom matching with Hindi support
        if (symptoms.includes('fever') || symptoms.includes('bukhār') || symptoms.includes('बुखार')) {
          if (symptoms.includes('cough') || symptoms.includes('khānsi') || symptoms.includes('खांसी')) {
            conditions = isHindiInput 
              ? ['सामान्य सर्दी', 'फ्लू (इन्फ्लुएंजा)', 'कोविड-१९'] 
              : ['Common cold', 'Flu (Influenza)', 'COVID-19'];
            recommendations = isHindiInput
              ? [
                  'भरपूर आराम करें',
                  'खूब पानी पिएं',
                  'बुखार के लिए पैरासिटामोल लें',
                  'यदि 3 दिन से अधिक समय तक लक्षण बने रहें तो डॉक्टर से परामर्श करें'
                ]
              : [
                  'Get plenty of rest',
                  'Stay hydrated',
                  'Take paracetamol for fever',
                  'Consult a doctor if symptoms worsen or persist for more than 3 days'
                ];
          } else if (symptoms.includes('headache') || symptoms.includes('sir dard') || symptoms.includes('सिरदर्द')) {
            conditions = isHindiInput
              ? ['वायरल बुखार', 'साइनस इन्फेक्शन', 'माइग्रेन']
              : ['Viral fever', 'Sinus infection', 'Migraine'];
            recommendations = isHindiInput
              ? [
                  'शांत, अंधेरे कमरे में आराम करें',
                  'माथे पर ठंडा कपड़ा रखें',
                  'दर्द निवारक दवा लें',
                  'पानी खूब पिएं और कैफीन से बचें'
                ]
              : [
                  'Rest in a quiet, dark room',
                  'Apply a cool compress to your forehead',
                  'Take over-the-counter pain relievers',
                  'Stay hydrated and avoid caffeine'
                ];
          } else {
            conditions = isHindiInput
              ? ['वायरल बुखार', 'बैक्टीरियल इन्फेक्शन', 'लू लगना']
              : ['Viral fever', 'Bacterial infection', 'Heat exhaustion'];
            recommendations = isHindiInput
              ? [
                  'बुखार कम करने की दवा लें',
                  'खूब सारा तरल पदार्थ पिएं',
                  'पूरा आराम करें',
                  'अगर बुखार 103°F (39.4°C) से अधिक हो या 3 दिन से ज्यादा रहे तो डॉक्टर को दिखाएं'
                ]
              : [
                  'Take a fever reducer like paracetamol',
                  'Drink plenty of fluids',
                  'Get adequate rest',
                  'See a doctor if fever is above 103°F (39.4°C) or lasts more than 3 days'
                ];
          }
        } else if (symptoms.includes('stomach') || symptoms.includes('pet') || symptoms.includes('पेट')) {
          if (symptoms.includes('vomit') || symptoms.includes('ulti') || symptoms.includes('उल्टी')) {
            conditions = isHindiInput
              ? ['गैस्ट्रोएंटेराइटिस', 'फूड पॉइजनिंग', 'पेट का फ्लू']
              : ['Gastroenteritis', 'Food poisoning', 'Stomach flu'];
            recommendations = isHindiInput
              ? [
                  'थोड़ी मात्रा में साफ तरल पदार्थ पिएं',
                  'उल्टी रुकने तक ठोस आहार न लें',
                  'केला, चावल, सेब का सॉस, टोस्ट (BRAT डाइट) आजमाएं',
                  'यदि लक्षण गंभीर हों या 2 दिन से अधिक रहें तो डॉक्टर को दिखाएं'
                ]
              : [
                  'Drink clear fluids in small amounts',
                  'Avoid solid foods until vomiting stops',
                  'Try the BRAT diet (bananas, rice, applesauce, toast)',
                  'Seek medical help if symptoms are severe or last more than 2 days'
                ];
          } else {
            conditions = isHindiInput
              ? ['अपच', 'गैस', 'एसिडिटी']
              : ['Indigestion', 'Gas', 'Acid reflux'];
            recommendations = isHindiInput
              ? [
                  'थोड़ा-थोड़ा करके अक्सर खाएं',
                  'तेज मसालेदार या चिकने भोजन से बचें',
                  'एंटासिड लें',
                  'खाने के तुरंत बाद न लेटें'
                ]
              : [
                  'Eat smaller, more frequent meals',
                  'Avoid spicy or fatty foods',
                  'Try over-the-counter antacids',
                  'Avoid lying down immediately after eating'
                ];
          }
        } else if (symptoms.includes('cough') || symptoms.includes('khānsi') || symptoms.includes('खांसी')) {
          conditions = isHindiInput
            ? ['सामान्य सर्दी', 'एलर्जी', 'ब्रोंकाइटिस']
            : ['Common cold', 'Allergies', 'Bronchitis'];
          recommendations = isHindiInput
            ? [
                'गर्म तरल पदार्थ पिएं',
                'ह्यूमिडिफायर का उपयोग करें',
                'गर्म पानी या चाय में शहद मिलाकर पिएं',
                'अगर खांसी 3 हफ्ते से अधिक रहे या तेज बुखार के साथ हो तो डॉक्टर को दिखाएं'
              ]
            : [
                'Stay hydrated with warm liquids',
                'Use a humidifier',
                'Try honey in warm water or tea',
                'See a doctor if cough lasts more than 3 weeks or is accompanied by high fever'
              ];
        } else {
          // Generic response for other symptoms
          conditions = isHindiInput
            ? ['सामान्य असुविधा', 'हल्की बीमारी', 'वायरल इन्फेक्शन']
            : ['General discomfort', 'Mild illness', 'Viral infection'];
          recommendations = isHindiInput
            ? [
                'भरपूर आराम करें',
                'खूब पानी पिएं',
                'अपने लक्षणों पर नजर रखें',
                'यदि लक्षण बने रहें या बिगड़ें तो डॉक्टर से परामर्श करें'
              ]
            : [
                'Get plenty of rest',
                'Stay hydrated',
                'Monitor your symptoms',
                'Consult a healthcare professional if symptoms persist or worsen'
              ];
        }

        // Use the language from the user's message or fallback to responseLanguage
        const useHindi = userMessage.language === 'hi' || responseLanguage === 'hi';
        let response;
        if (useHindi) {
          response = `आपके लक्षणों के आधार पर, यहां कुछ संभावित स्थितियां और सुझाव दिए गए हैं:\n\n` +
                   `*संभावित स्थितियां:*\n${conditions.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n` +
                   `*सुझाव:*\n${recommendations.map((r, i) => `• ${r}`).join('\n')}\n\n` +
                   `*महत्वपूर्ण:* यह कोई चिकित्सा निदान नहीं है। सटीक जांच के लिए कृपया किसी योग्य स्वास्थ्य सेवा प्रदाता से परामर्श लें।`;
        } else {
          response = `Based on your symptoms, here are some possible conditions and recommendations:\n\n` +
                   `*Possible Conditions:*\n${conditions.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n` +
                   `*Recommendations:*\n${recommendations.map((r, i) => `• ${r}`).join('\n')}\n\n` +
                   `*Important:* This is not a medical diagnosis. Please consult a healthcare professional for an accurate assessment.`;
        }

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: response
          }
        ]);
      } catch (error) {
        console.error('Error analyzing symptoms:', error);
        
        const errorMessage = isHindiInput
          ? 'मुझे आपके लक्षणों का विश्लेषण करने में कठिनाई हो रही है। कृपया उन्हें और विस्तार से बताएं या सटीक मूल्यांकन के लिए किसी स्वास्थ्य सेवा प्रदाता से परामर्श लें।'
          : 'I\'m having trouble analyzing your symptoms. Please try to describe them in more detail or consult a healthcare professional for an accurate assessment.';
        
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: errorMessage
          }
        ]);
      } finally {
        setLoading(false);
      }
    }, 1000); // Simulate network delay
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
