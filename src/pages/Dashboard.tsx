import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { TrendingUp, Zap, BookOpen, Target } from 'lucide-react'

interface Stats {
  papers: number
  hypotheses: number
  experiments: number
  reports: number
}

export default function Dashboard() {
  const api = useApi()
  const [stats, setStats] = useState<Stats>({ papers: 0, hypotheses: 0, experiments: 0, reports: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [papers, hypotheses, experiments, reports] = await Promise.all([
          api.get('/api/papers').catch(() => []),
          api.get('/api/hypotheses').catch(() => []),
          api.get('/api/experiments').catch(() => []),
          api.get('/api/reports').catch(() => []),
        ])

        setStats({
          papers: Array.isArray(papers) ? papers.length : 0,
          hypotheses: Array.isArray(hypotheses) ? hypotheses.length : 0,
          experiments: Array.isArray(experiments) ? experiments.length : 0,
          reports: Array.isArray(reports) ? reports.length : 0,
        })
      } catch (err) {
        console.error('Failed to load stats:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [api])

  const statCards = [
    { label: 'Papers', value: stats.papers, icon: BookOpen, color: 'blue' },
    { label: 'Hypotheses', value: stats.hypotheses, icon: Zap, color: 'yellow' },
    { label: 'Experiments', value: stats.experiments, icon: Target, color: 'green' },
    { label: 'Reports', value: stats.reports, icon: TrendingUp, color: 'purple' },
  ]

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your research workspace</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className={`inline-block p-3 rounded-lg mb-4 ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">Browse Papers</h3>
            <p className="text-gray-700 text-sm">Search and explore research papers from arXiv</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-gray-900 mb-2">Generate Hypotheses</h3>
            <p className="text-gray-700 text-sm">Create research hypotheses based on papers</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-2">Run Experiments</h3>
            <p className="text-gray-700 text-sm">Train ML models and evaluate hypotheses</p>
          </div>
        </div>
      </div>
    </div>
  )
}
