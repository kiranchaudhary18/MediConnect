import { useState } from 'react'
import { HeartPulse, Lightbulb, ShieldCheck, Send, Sparkles } from 'lucide-react'
import { sendHealthTip, generateHealthTipAI } from '../../services/patientService'
import toast from 'react-hot-toast'

const defaults = [
  {
    id: 1,
    title: 'Post-op Recovery Basics',
    body: 'Encourage early ambulation, adequate hydration, and pain control. Schedule a follow-up within 7 days.',
    tag: 'Surgery',
  },
  {
    id: 2,
    title: 'Hypertension Lifestyle',
    body: 'Recommend 30 minutes of moderate exercise 5x/week, low-sodium diet, and home BP monitoring.',
    tag: 'Cardiology',
  },
  {
    id: 3,
    title: 'Diabetes Foot Care',
    body: 'Daily foot checks, moisturize (avoid between toes), comfortable footwear, and annual podiatry exam.',
    tag: 'Endocrinology',
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
      // Pre-fill form to send
      setTitle(`AI Tip for ${aiCondition}`)
      setBody(content)
      setTag(aiAudience === 'student' ? 'Student' : 'General')
      toast.success('AI tip generated. You can edit and send.')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <div className="flex items-center gap-3">
        <HeartPulse className="h-6 w-6 text-rose-500" />
        <div>
          <h1 className="text-2xl font-bold">Health Tips</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Send quick guidance directly to patients or students via email.</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="grid gap-4 md:grid-cols-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold">Create & Send</h3>
        </div>
        
        {/* AI Generate Section - Inside Form */}
        <div className="md:col-span-2 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
            <Sparkles className="h-5 w-5" />
            <h4 className="font-semibold">Generate with AI (Grok)</h4>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="block text-sm mb-1">Condition *</label>
              <input
                value={aiCondition}
                onChange={(e) => setAiCondition(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                placeholder="e.g., Diabetes"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm mb-1">Audience</label>
              <select
                value={aiAudience}
                onChange={(e) => setAiAudience(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              >
                <option value="patient">Patient</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div className="sm:col-span-1 flex items-end">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={aiLoading || !aiCondition}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {aiLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
          {aiResult && (
            <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-green-600 dark:text-green-400 mb-1">✓ AI tip generated and filled in the form below</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            placeholder="Eg. Post-op recovery basics"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Tag</label>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            placeholder="Eg. Cardiology"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Message *</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            placeholder="Share guidance or instructions"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Send to (email) *</label>
          <input
            type="email"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            placeholder="patient@example.com"
            required
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send Tip'}
          </button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {defaults.map((tip) => (
          <div
            key={tip.id}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
                <Lightbulb className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wide">{tip.tag}</span>
              </div>
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="text-lg font-semibold leading-tight">{tip.title}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{tip.body}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Use the form above to send this guidance to any patient or student.</p>
          </div>
        ))}
      </div>
    </div>
  )
}
