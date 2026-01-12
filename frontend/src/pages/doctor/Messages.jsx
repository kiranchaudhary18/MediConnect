import { MessageSquare, Search, Send } from 'lucide-react'
import { useState } from 'react'

const sampleThreads = [
  { id: 1, patient: 'John Doe', lastMessage: 'Thanks, doctor!', time: '10:24 AM' },
  { id: 2, patient: 'Jane Smith', lastMessage: 'Any update on labs?', time: 'Yesterday' },
  { id: 3, patient: 'David Lee', lastMessage: 'Feeling better now.', time: 'Mon' },
]

export default function Messages() {
  const [selected, setSelected] = useState(sampleThreads[0])
  const [text, setText] = useState('')

  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1fr] h-full text-gray-900 dark:text-gray-100">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Messages</h2>
          <div className="mt-3 relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              placeholder="Search patients"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sampleThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setSelected(thread)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                selected.id === thread.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{thread.patient}</p>
                <span className="text-xs text-gray-500">{thread.time}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{thread.lastMessage}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex flex-col min-h-[420px]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="font-semibold">{selected.patient}</p>
            <p className="text-sm text-gray-500">Secure messages</p>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="self-start max-w-[80%] rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
            <p className="text-sm text-gray-800 dark:text-gray-100">Hi doctor, I’m feeling better after the new meds.</p>
            <span className="text-[11px] text-gray-500">Today, 9:10 AM</span>
          </div>
          <div className="self-end max-w-[80%] rounded-lg bg-indigo-600 text-white p-3 shadow-sm">
            <p className="text-sm">Glad to hear. Continue dosage for 5 days and hydrate.</p>
            <span className="text-[11px] text-indigo-100">Today, 9:12 AM</span>
          </div>
        </div>
        <form
          className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            setText('')
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
