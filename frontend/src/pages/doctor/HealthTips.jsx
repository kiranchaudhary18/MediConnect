import { HeartPulse, Lightbulb, ShieldCheck } from 'lucide-react'

const tips = [
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
  return (
    <div className="space-y-5 text-gray-900 dark:text-gray-100">
      <div className="flex items-center gap-3">
        <HeartPulse className="h-6 w-6 text-rose-500" />
        <div>
          <h1 className="text-2xl font-bold">Health Tips</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Share quick guidance with patients or students.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tips.map((tip) => (
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
            <button className="inline-flex self-start items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
              Share with patient
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
