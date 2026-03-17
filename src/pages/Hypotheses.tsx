import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Lightbulb } from 'lucide-react'

interface Hypothesis {
  id: string
  hypothesis_text: string
  reasoning: string
  created_at: string
}

export default function Hypotheses() {
  const api = useApi()
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHypotheses = async () => {
      try {
        const data = await api.get('/api/hypotheses')
        setHypotheses(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load hypotheses:', err)
      } finally {
        setLoading(false)
      }
    }

    loadHypotheses()
  }, [api])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Hypotheses</h1>
        <p className="text-gray-600 mt-2">Research hypotheses based on papers and evidence</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 animate-pulse border border-gray-200">
              <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : hypotheses.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <Lightbulb className="mx-auto mb-4 text-yellow-600" size={48} />
          <p className="text-gray-600 text-lg">No hypotheses created yet</p>
          <p className="text-gray-500 text-sm mt-2">Start by exploring papers and generating hypotheses</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hypotheses.map((hypothesis) => (
            <div key={hypothesis.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{hypothesis.hypothesis_text}</h3>
              {hypothesis.reasoning && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Reasoning:</p>
                  <p className="text-gray-600 text-sm">{hypothesis.reasoning}</p>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Created: {new Date(hypothesis.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
