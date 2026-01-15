import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  Stethoscope,
  GraduationCap,
  Check,
  CheckCheck,
  Clock,
  ArrowLeft,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getConversations, getMessages, sendMessage, deleteMessage, getMyDoctors } from '../../services/messageService';
import { toast } from 'react-hot-toast';

export default function PatientMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversations from doctors and students who have access to patient
  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Fetch patient's doctors (from appointments)
      let doctors = [];
      try {
        const doctorsRes = await getMyDoctors();
        doctors = (doctorsRes || []).map(doc => ({
          id: doc._id,
          name: doc.name || 'Doctor',
          role: 'doctor',
          specialization: doc.specialization || 'General',
          avatar: doc.profilePicture || doc.photoURL || null,
          lastMessage: 'Start a conversation',
          time: '',
          unread: 0,
          online: false
        }));
      } catch (err) {
        console.error('Failed to load doctors', err);
      }

      // Fetch conversations (existing chats with doctors/students)
      let existingChats = [];
      try {
        const chatsRes = await getConversations();
        existingChats = (chatsRes || []).map(conv => ({
          id: conv._id || conv.partnerId || conv.partner?._id,
          name: conv.name || conv.partnerName || conv.partner?.name || 'User',
          role: conv.role || conv.partner?.role || 'doctor',
          specialization: conv.specialization || conv.partner?.specialization || '',
          avatar: conv.profilePicture || conv.avatar || conv.partner?.profilePicture || null,
          lastMessage: conv.lastMessage || 'No messages yet',
          time: conv.lastMessageTime ? formatTime(conv.lastMessageTime) : '',
          unread: conv.unreadCount || 0,
          online: conv.online || false
        }));
      } catch (err) {
        console.error('Failed to load conversations', err);
      }

      // Merge all conversations, avoiding duplicates
      const allConversations = [...doctors];
      
      // Add existing chats that aren't already in doctors list
      existingChats.forEach(chat => {
        const existingIdx = allConversations.findIndex(c => c.id === chat.id);
        if (existingIdx === -1) {
          allConversations.push(chat);
        } else {
          // Update with latest message info
          allConversations[existingIdx].lastMessage = chat.lastMessage;
          allConversations[existingIdx].time = chat.time;
          allConversations[existingIdx].unread = chat.unread;
        }
      });

      setConversations(allConversations);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadMessages = async (partnerId) => {
    try {
      setMessagesLoading(true);
      const data = await getMessages(partnerId);
      const formattedMessages = (data || []).map(msg => ({
        id: msg._id,
        senderId: msg.senderId?._id || msg.senderId,
        text: msg.message,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: msg.read ? 'read' : 'delivered'
      }));
      setMessages(formattedMessages);
    } catch (err) {
      console.error('Failed to load messages', err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const tempMessage = {
      id: Date.now().toString(),
      senderId: user._id,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    const messageText = newMessage;
    setNewMessage('');
    setSending(true);

    try {
      await sendMessage(selectedConversation.id, messageText);
      
      setMessages(prev => prev.map(m => 
        m.id === tempMessage.id ? { ...m, status: 'delivered' } : m
      ));

      // Update conversation last message
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, lastMessage: messageText, time: 'Just now' } 
          : c
      ));
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Failed to delete message', error);
      toast.error('Failed to delete message');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || conv.role === activeTab;
    return matchesSearch && matchesTab;
  });

  const selectConversation = (conv) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
    // Mark as read
    setConversations(prev => prev.map(c => 
      c.id === conv.id ? { ...c, unread: 0 } : c
    ));
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full animate-spin border-t-emerald-600" />
          <MessageSquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Conversations List */}
      <div className={`w-full md:w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            <button
              onClick={loadConversations}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'all', label: 'All', icon: MessageSquare },
              { id: 'doctor', label: 'Doctors', icon: Stethoscope },
              { id: 'student', label: 'Students', icon: GraduationCap }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {activeTab === 'doctor' 
                  ? 'No doctors yet' 
                  : activeTab === 'student'
                    ? 'No students yet'
                    : 'No conversations yet'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {activeTab === 'doctor' 
                  ? 'Book an appointment to connect with doctors' 
                  : activeTab === 'student'
                    ? 'Students assigned to your cases will appear here'
                    : 'Start chatting with your healthcare providers'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  selectedConversation?.id === conv.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold overflow-hidden ${
                    conv.role === 'doctor' 
                      ? 'bg-gradient-to-br from-violet-400 to-purple-500' 
                      : 'bg-gradient-to-br from-teal-400 to-cyan-500'
                  }`}>
                    {conv.avatar ? (
                      <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                    ) : (
                      conv.name?.[0] || '?'
                    )}
                  </div>
                  {conv.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {conv.role === 'doctor' ? `Dr. ${conv.name}` : conv.name}
                    </h3>
                    {conv.time && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {conv.time}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-0.5">
                    {conv.role === 'doctor' ? (conv.specialization || 'Doctor') : 'Medical Student'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {conv.lastMessage}
                  </p>
                </div>

                {/* Unread Badge */}
                {conv.unread > 0 && (
                  <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{conv.unread}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden ${
                  selectedConversation.role === 'doctor' 
                    ? 'bg-gradient-to-br from-violet-400 to-purple-500' 
                    : 'bg-gradient-to-br from-teal-400 to-cyan-500'
                }`}>
                  {selectedConversation.avatar ? (
                    <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedConversation.name?.[0] || '?'
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.role === 'doctor' ? `Dr. ${selectedConversation.name}` : selectedConversation.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    {selectedConversation.online && (
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                    {selectedConversation.role === 'doctor' 
                      ? (selectedConversation.specialization || 'Doctor') 
                      : 'Medical Student'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-emerald-200 dark:border-emerald-800 rounded-full animate-spin border-t-emerald-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Send a message to start the conversation</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderId = msg.senderId;
                  const isMe = senderId === user._id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          isMe 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-br-md' 
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-gray-400">{msg.time}</span>
                          {isMe && (
                            <>
                              <span className="text-xs text-gray-400">
                                {msg.status === 'sending' && <Clock className="w-3 h-3" />}
                                {msg.status === 'delivered' && <Check className="w-3 h-3" />}
                                {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                              </span>
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete message"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Your Messages
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Chat with your doctors and medical students assigned to your case.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
