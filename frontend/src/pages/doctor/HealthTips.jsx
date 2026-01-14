import { useState } from 'react'
import { 
  HeartPulse, 
  Lightbulb, 
  ShieldCheck, 
  Send, 
  Sparkles, 
  Mail,
  Tag,
  FileText,
  Loader2,
  CheckCircle,
  Zap
} from 'lucide-react'
import { sendHealthTip, generateHealthTipAI } from '../../services/patientService'
import toast from 'react-hot-toast'

const defaults = [
  {
    id: 1,
    title: 'Post-op Recovery Basics',
    body: 'Encourage early ambulation, adequate hydration, and pain control. Schedule a follow-up within 7 days.',
    tag: 'Surgery',
    color: 'from-rose-500 to-pink-500'
  },
  {
    id: 2,
    title: 'Hypertension Lifestyle',
    body: 'Recommend 30 minutes of moderate exercise 5x/week, low-sodium diet, and home BP monitoring.',
    tag: 'Cardiology',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 3,
    title: 'Diabetes Foot Care',
    body: 'Daily foot checks, moisturize (avoid between toes), comfortable footwear, and annual podiatry exam.',
    tag: 'Endocrinology',
    color: 'from-amber-500 to-orange-500'
  },
]

export default function HealthTips() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tag, setTag] = useState('General')
  const [targetEmail, setTargetEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [aiCondition, setAiCondition] = useState('')
  const [aiAudience, setAiAudience] = useState('patient')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')

  const handleSend = async (e) => {
    e.preventDefault()
    if (!title || !body || !targetEmail) {
      toast.error('Title, message, and email are required')
      return
    }
    try {
      setSending(true)
      await sendHealthTip({ title, message: body, tag, targetEmail })
      toast.success('Health tip sent successfully')
      setTitle('')
      setBody('')
      setTag('General')
      setTargetEmail('')
      setAiResult('')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const handleGenerate = async () => {
    if (!aiCondition) {
      toast.error('Please enter a condition')
      return
    }
    try {
      setAiLoading(true)
      const { content } = await generateHealthTipAI({ condition: aiCondition, audience: aiAudience })
      setAiResult(content)
      setTitle(`AI Tip for ${aiCondition}`)
      setBody(content)
      setTag(aiAudience === 'student' ? 'Student' : 'General')
      toast.success('AI tip generated!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const useTemplate = (tip) => {
    setTitle(tip.title)
    setBody(tip.body)
    setTag(tip.tag)
    toast.success('Template loaded!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Tips</h1>
            <p className="text-gray-500 dark:text-gray-400">Send guidance to patients and students</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Generator Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Health Tip Generator</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Grok AI</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medical Condition</label>
              <input
                value={aiCondition}
                onChange={(e) => setAiCondition(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                placeholder="e.g., Diabetes, Hypertension, Anxiety..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
              <select
                value={aiAudience}
                onChange={(e) => setAiAudience(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              >
                <option value="patient">Patient</option>
                <option value="student">Medical Student</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={aiLoading || !aiCondition}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-lg shadow-amber-500/25 disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate with AI
                </>
              )}
            </button>
            {aiResult && (
              <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-400">AI tip generated and filled in the form!</span>
              </div>
            )}
          </div>
        </div>

        {/* Send Form Card */}
        <form onSubmit={handleSend} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Send Health Tip</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Compose and send via email</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                  placeholder="Health tip title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tag</label>
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                  placeholder="e.g., Cardiology"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm resize-none"
                placeholder="Share your health guidance..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                  placeholder="patient@example.com"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-medium shadow-lg shadow-violet-500/25 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Health Tip
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Templates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Templates</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {defaults.map((tip) => (
            <div
              key={tip.id}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${tip.color}`}>
                  {tip.tag}
                </div>
                <ShieldCheck className="w-5 h-5 text-green-500" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{tip.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{tip.body}</p>
              <button
                onClick={() => useTemplate(tip)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400 transition-all text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
