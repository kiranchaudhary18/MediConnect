import { MessageSquare, Search, Send, Plus, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getConversations, getMessages, sendMessage, getMyDoctors } from '../../services/messageService'
import toast from 'react-hot-toast'

export default function Messages() {
  const [conversations, setConversations] = useState([])
  const [allDoctors, setAllDoctors] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)

  useEffect(() => {
    loadConversations()
    loadDoctors()
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

  const loadDoctors = async () => {
    try {
      const data = await getMyDoctors()
      setAllDoctors(data)
    } catch (err) {
      console.error('Failed to load doctors', err)
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

  const startNewChat = (doctor) => {
    setSelected({
      partner: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        photoURL: doctor.photoURL,
        role: doctor.role,
        specialization: doctor.specialization
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

  const filteredDoctors = allDoctors.filter((doctor) =>
    doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[360px,1fr] min-h-[calc(100vh-4rem)] text-gray-900 dark:text-gray-100 w-full">
      {/* Left Panel */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Messages</h2>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className={`p-2 rounded-lg transition ${
                showNewChat 
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              title="New Chat"
            >
              {showNewChat ? <Users className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              placeholder={showNewChat ? "Search doctors..." : "Search conversations..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showNewChat ? (
            <>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
                All Doctors ({filteredDoctors.length})
              </div>
              {filteredDoctors.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No doctors found</div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <button
                    key={doctor._id}
                    onClick={() => startNewChat(doctor)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                      selected?.partner?._id === doctor._id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        {doctor.photoURL ? (
                          <img src={doctor.photoURL} alt={doctor.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-green-600 dark:text-green-300 font-medium">
                            {doctor.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Dr. {doctor.name}</p>
                        <p className="text-xs text-gray-500">{doctor.specialization || doctor.email}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </>
          ) : (
            <>
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No conversations yet</p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="mt-2 text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
                  >
                    Message a doctor
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.partner._id}
                    onClick={() => setSelected(conv)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                      selected?.partner?._id === conv.partner._id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          {conv.partner.photoURL ? (
                            <img src={conv.partner.photoURL} alt={conv.partner.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-green-600 dark:text-green-300 font-medium">
                              {conv.partner.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{conv.partner.role === 'doctor' ? 'Dr. ' : ''}{conv.partner.name}</p>
                          <p className="text-xs text-gray-500">{conv.partner.email}</p>
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1 mt-1 ml-13">
                      {conv.lastMessage}
                    </p>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex flex-col min-h-[420px]">
        {selected ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                {selected.partner.photoURL ? (
                  <img src={selected.partner.photoURL} alt={selected.partner.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="text-green-600 dark:text-green-300 font-medium">
                    {selected.partner.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold">{selected.partner.role === 'doctor' ? 'Dr. ' : ''}{selected.partner.name}</p>
                <p className="text-sm text-gray-500">{selected.partner.specialization || selected.partner.email}</p>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId._id === JSON.parse(localStorage.getItem('user') || '{}')._id
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                          isOwn
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <span className={`text-[11px] mt-1 block ${
                          isOwn ? 'text-indigo-100' : 'text-gray-500'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <form
              className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3"
              onSubmit={handleSend}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="h-12 w-12 mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">or message a doctor</p>
            <button
              onClick={() => setShowNewChat(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Message Doctor
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
