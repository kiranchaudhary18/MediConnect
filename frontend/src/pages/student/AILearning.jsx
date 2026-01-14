import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Stethoscope, Brain, Loader2, Plus, History, X, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from '../../utils/axios';

const AILearning = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistories, setChatHistories] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const welcomeMessage = {
    id: 'welcome',
    role: 'assistant',
    content: `Hello! I'm your AI Medical Learning Assistant. I can help you with:

• **Medical Concepts** - Explain diseases, symptoms, and treatments
• **Case Study Analysis** - Help you understand patient cases
• **Exam Preparation** - Quiz you on medical topics
• **Research Assistance** - Find information on medical subjects

What would you like to learn about today?`,
    timestamp: new Date()
  };

  const quickPrompts = [
    { icon: Stethoscope, text: 'Explain common symptoms of diabetes', category: 'Symptoms' },
    { icon: Brain, text: 'What are the stages of heart failure?', category: 'Conditions' },
    { icon: BookOpen, text: 'Quiz me on anatomy basics', category: 'Study' },
    { icon: Sparkles, text: 'Explain the difference between viral and bacterial infections', category: 'Concepts' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat histories on mount
  useEffect(() => {
    loadChatHistories();
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, []);

  const loadChatHistories = async () => {
    try {
      setLoadingHistory(true);
      const response = await axios.get('/patient/chat-history');
      setChatHistories(response.data?.data || []);
    } catch (error) {
      console.error('Error loading chat histories:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([welcomeMessage]);
    setShowHistory(false);
  };

  const loadChat = async (chatId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/patient/chat-history/${chatId}`);
      const chat = response.data?.data;
      
      if (chat && chat.messages) {
        setMessages(chat.messages.map((m, idx) => ({
          id: m._id || idx,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp)
        })));
        setCurrentChatId(chatId);
      }
      setShowHistory(false);
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`/patient/chat-history/${chatId}`);
      setChatHistories(prev => prev.filter(c => c._id !== chatId));
      if (currentChatId === chatId) {
        startNewChat();
      }
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    // If this is first message (only welcome message), clear it
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([userMessage]);
    } else {
      setMessages(prev => [...prev, userMessage]);
    }
    setInput('');
    setLoading(true);

    try {
      // Send message with chatId
      const response = await axios.post('/patient/chat-history/message', {
        message: messageText,
        chatId: currentChatId
      });

      const data = response.data?.data;
      
      // Update chat ID if new chat was created
      if (data?.chatId && !currentChatId) {
        setCurrentChatId(data.chatId);
        loadChatHistories(); // Refresh history list
      }

      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data?.response || 'I apologize, but I encountered an issue. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Learning error:', error);
      
      const errorResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again later.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex">
      {/* History Sidebar */}
      <div className={`${showHistory ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5" />
            Chat History
          </h2>
          <button
            onClick={() => setShowHistory(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingHistory ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            </div>
          ) : chatHistories.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No chat history yet
            </p>
          ) : (
            chatHistories.map((chat) => (
              <div
                key={chat._id}
                onClick={() => loadChat(chat._id)}
                className={`group p-3 rounded-lg cursor-pointer transition-all ${
                  currentChatId === chat._id
                    ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {chat.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(chat.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat._id, e)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Chat History"
              >
                <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Learning Assistant</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your personal medical education companion</p>
              </div>
            </div>
            <button
              onClick={startNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-orange-500' 
                    : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                }`}>
                  <div 
                    className={`prose prose-sm max-w-none ${
                      message.role === 'user' ? 'prose-invert' : 'dark:prose-invert'
                    }`}
                    dangerouslySetInnerHTML={{ 
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                        .replace(/^### (.*$)/gm, '<h4 class="font-semibold mt-2 mb-1">$1</h4>')
                        .replace(/^## (.*$)/gm, '<h3 class="font-bold text-lg mt-3 mb-2">$1</h3>')
                        .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
                    }}
                  />
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-orange-100' : 'text-gray-400'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="bg-gray-50 dark:bg-gray-900 px-4 pb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick prompts:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(prompt.text)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <prompt.icon className="w-4 h-4 text-purple-500" />
                  {prompt.text.substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about medical topics..."
              className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className={`p-3 rounded-xl transition-colors ${
                input.trim() && !loading
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI responses are for educational purposes only. Always consult medical professionals for real diagnoses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AILearning;
