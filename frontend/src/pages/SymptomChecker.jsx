import { useState } from 'react'
import Navbar from '../components/Navbar'

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyzeSymptoms = () => {
    setLoading(true)
    // Mock AI analysis - replace with actual API call
    setTimeout(() => {
      setResults({
        possibleCauses: [
          'Common cold',
          'Allergies',
          'Seasonal flu',
          'Stress-related symptoms'
        ],
        recommendations: [
          'Stay hydrated',
          'Get plenty of rest',
          'Consult a doctor if symptoms persist',
          'Monitor your temperature'
        ]
      })
      setLoading(false)
    }, 2000)
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">AI Symptom Checker</h1>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Describe your symptoms
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full h-40 p-3 border rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Headache, fever, body aches..."
          />
          <button
            onClick={analyzeSymptoms}
            disabled={loading || !symptoms}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"
          >
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>

          {results && (
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg dark:text-white">Possible Causes:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {results.possibleCauses.map((cause, idx) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">{cause}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white">Recommendations:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {results.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">{rec}</li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Disclaimer: This is for informational purposes only. Please consult a healthcare professional for proper diagnosis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SymptomChecker




