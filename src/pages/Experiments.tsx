import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Beaker, CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle } from 'lucide-react'

interface Experiment {
  id: string
  model_type: string
  dataset_name: string
  status: string
  accuracy?: number
  precision?: number
  recall?: number
  f1_score?: number
  created_at: string
  completed_at?: string
}

export default function Experiments() {
  const api = useApi()
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadExperiments = async () => {
      try {
        const data = await api.get('/api/experiments')
        setExperiments(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load experiments:', err)
      } finally {
        setLoading(false)
      }
    }

    loadExperiments()
  }, [api])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />
      case 'running':
        return <Clock className="text-blue-600 animate-spin" size={20} />
      case 'failed':
        return <AlertCircle className="text-red-600" size={20} />
      default:
        return <Clock className="text-gray-400" size={20} />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Experiments</h1>
        <p className="text-gray-600 mt-2">ML model training runs and results</p>
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
      ) : experiments.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <Beaker className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 text-lg">No experiments yet</p>
          <p className="text-gray-500 text-sm mt-2">Create a hypothesis and run an experiment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiments.map((experiment) => (
            <div key={experiment.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(experiment.status)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {experiment.model_type === 'random_forest' ? 'Random Forest' : 'Logistic Regression'}
                    </h3>
                  </div>
                  {experiment.dataset_name && (
                    <p className="text-sm text-gray-600">Dataset: {experiment.dataset_name}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  experiment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  experiment.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  experiment.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
                </span>
              </div>

              {experiment.status === 'completed' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-200">
                  {experiment.accuracy !== null && (
                    <div>
                      <p className="text-xs text-gray-600">Accuracy</p>
                      <p className="text-lg font-semibold text-gray-900">{(experiment.accuracy * 100).toFixed(2)}%</p>
                    </div>
                  )}
                  {experiment.precision !== null && (
                    <div>
                      <p className="text-xs text-gray-600">Precision</p>
                      <p className="text-lg font-semibold text-gray-900">{(experiment.precision * 100).toFixed(2)}%</p>
                    </div>
                  )}
                  {experiment.recall !== null && (
                    <div>
                      <p className="text-xs text-gray-600">Recall</p>
                      <p className="text-lg font-semibold text-gray-900">{(experiment.recall * 100).toFixed(2)}%</p>
                    </div>
                  )}
                  {experiment.f1_score !== null && (
                    <div>
                      <p className="text-xs text-gray-600">F1 Score</p>
                      <p className="text-lg font-semibold text-gray-900">{(experiment.f1_score * 100).toFixed(2)}%</p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500">
                Created: {new Date(experiment.created_at).toLocaleDateString()}
                {experiment.completed_at && ` • Completed: ${new Date(experiment.completed_at).toLocaleDateString()}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
