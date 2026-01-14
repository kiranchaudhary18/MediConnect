import { MessageSquare, Search, Send, Plus, Users, PanelLeftClose, PanelLeft, GraduationCap, User } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { getConversations, getMessages, sendMessage } from '../../services/messageService'
import { getDoctorPatients } from '../../services/patientService'
import axios from '../../utils/axios'
import toast from 'react-hot-toast'

export default function Messages() {
  const [conversations, setConversations] = useState([])
  const [allPatients, setAllPatients] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatTab, setChatTab] = useState('all') // 'all', 'patients', 'students'
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    loadConversations()
    loadPatients()
    loadStudents()
    const interval = setInterval(loadConversations, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selected?.partner?._id) {
      loadMessages(selected.partner._id)
      const interval = setInterval(() => loadMessages(selected.partner._id), 2000)
      return () => clearInterval(interval)
    }
  }, [selected])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load conversations', err)
      setLoading(false)
    }
  }

  const loadPatients = async () => {
    try {
      const data = await getDoctorPatients()
      const mapped = (Array.isArray(data) ? data : []).map(p => ({
        _id: p._id || p.id,
        name: p.name,
        email: p.email,
        photoURL: p.photoURL,
        role: 'patient'
      }))
      setAllPatients(mapped)
    } catch (err) {
      console.error('Failed to load patients', err)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await axios.get('/patient/doctor/students')
      const studentsData = response.data?.data || []
      // Only get accepted students - data is flat, not nested
      const acceptedStudents = studentsData
        .filter(s => s.selectionStatus === 'accepted')
        .map(s => ({
          _id: s._id || s.id,
          name: s.name,
          email: s.email,
          photoURL: s.profilePicture || s.photoURL,
          role: 'student'
        }))
      setAllStudents(acceptedStudents)
    } catch (err) {
      console.error('Failed to load students', err)
    }
  }

  const loadMessages = async (partnerId) => {
    try {
      const data = await getMessages(partnerId)
      setMessages(data)
    } catch (err) {
      console.error('Failed to load messages', err)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !selected?.partner?._id) return
    setSending(true)
    try {
      const newMessage = await sendMessage(selected.partner._id, text)
      setMessages([...messages, newMessage])
      setText('')
      toast.success('Message sent')
      loadConversations()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const startNewChat = (patient) => {
    setSelected({
      partner: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        photoURL: patient.photoURL,
        role: patient.role
      },
      lastMessage: '',
      unreadCount: 0
    })
    setMessages([])
    setShowNewChat(false)
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.partner?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPatients = allPatients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredStudents = allStudents.filter((student) =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Combined list based on tab
  const getFilteredContacts = () => {
    if (chatTab === 'patients') return filteredPatients
    if (chatTab === 'students') return filteredStudents
    return [...filteredPatients, ...filteredStudents]
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
      {/* Left Sidebar - Conversations */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {showNewChat ? 'New Chat' : 'Chats'}
            </h2>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className={`p-2 rounded-lg transition-all ${
                showNewChat 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-500 hover:text-white'
              }`}
              title={showNewChat ? "View Chats" : "New Chat"}
            >
              {showNewChat ? <Users className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {showNewChat ? (
            <>
              {/* Tabs for filtering */}
              <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <button
                  onClick={() => setChatTab('all')}
                  className={`flex-1 py-2 text-xs font-medium transition-all ${
                    chatTab === 'all' 
                      ? 'text-blue-600 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setChatTab('patients')}
                  className={`flex-1 py-2 text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    chatTab === 'patients' 
                      ? 'text-blue-600 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <User className="h-3 w-3" /> Patients
                </button>
                <button
                  onClick={() => setChatTab('students')}
                  className={`flex-1 py-2 text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    chatTab === 'students' 
                      ? 'text-blue-600 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <GraduationCap className="h-3 w-3" /> Students
                </button>
              </div>
              
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {chatTab === 'all' ? 'All Contacts' : chatTab === 'patients' ? 'Patients' : 'Students'} ({getFilteredContacts().length})
              </div>
              {getFilteredContacts().length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No {chatTab === 'all' ? 'contacts' : chatTab} found
                </div>
              ) : (
                getFilteredContacts().map((contact) => (
                  <button
                    key={contact._id}
                    onClick={() => startNewChat(contact)}
                    className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all ${
                      selected?.partner?._id === contact._id ? 'bg-blue-50 dark:bg-gray-800 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {contact.photoURL ? (
                        <img src={contact.photoURL} alt={contact.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          contact.role === 'student' ? 'bg-indigo-500' : 'bg-blue-500'
                        }`}>
                          <span className="text-white font-medium text-sm">
                            {contact.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{contact.name}</p>
                          {contact.role === 'student' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded">
                              Student
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.email}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </>
          ) : (
            <>
              {loading ? (
                <div className="p-6 text-center">
                  <div className="w-8 h-8 mx-auto border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No conversations</p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="mt-3 text-sm text-blue-500 hover:underline"
                  >
                    Start a chat
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.partner._id}
                    onClick={() => setSelected(conv)}
                    className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all ${
                      selected?.partner?._id === conv.partner._id ? 'bg-blue-50 dark:bg-gray-800 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {conv.partner.photoURL ? (
                          <img src={conv.partner.photoURL} alt={conv.partner.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {conv.partner.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-50 dark:border-gray-950"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{conv.partner.name}</p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage || 'No messages'}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {selected ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all"
                >
                  {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
                </button>
                <div className="relative">
                  {selected.partner.photoURL ? (
                    <img src={selected.partner.photoURL} alt={selected.partner.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {selected.partner.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selected.partner.name}</p>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50 dark:bg-gray-950">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No messages yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                  const senderId = msg.senderId?._id || msg.senderId
                  const isOwn = senderId === currentUser._id || senderId === currentUser.id
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                        {!isOwn && (
                          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-medium">
                              {selected.partner.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            isOwn
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <span className={`text-[10px] mt-1 block ${
                            isOwn ? 'text-blue-100' : 'text-gray-400'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              onSubmit={handleSend}
            >
              <div className="flex items-center gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="p-2.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-4 left-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all"
            >
              {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </button>
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Select a conversation</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Choose from your existing chats or start a new one</p>
              <button
                onClick={() => { setShowNewChat(true); setSidebarOpen(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
