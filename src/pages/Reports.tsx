import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { FileCheck, Download } from 'lucide-react'

interface Report {
  id: string
  content: string
  critique: string
  recommendations: string
  created_at: string
}

export default function Reports() {
  const api = useApi()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await api.get('/api/reports')
        setReports(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load reports:', err)
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [api])

  const handleDownload = (report: Report) => {
    const content = `# Research Report

## Summary
${report.content}

## Critique
${report.critique}

## Recommendations
${report.recommendations}

---
Generated: ${new Date(report.created_at).toLocaleString()}`

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${report.id.slice(0, 8)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Research Reports</h1>
        <p className="text-gray-600 mt-2">Final analyzed and critiqued research findings</p>
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
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <FileCheck className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 text-lg">No reports generated yet</p>
          <p className="text-gray-500 text-sm mt-2">Complete experiments to generate reports</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Research Report</h3>
                  {report.content && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Summary:</p>
                      <p className="text-gray-600 text-sm line-clamp-3">{report.content}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDownload(report)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>

              {report.critique && (
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-900 mb-1">Critique:</p>
                  <p className="text-yellow-800 text-sm">{report.critique}</p>
                </div>
              )}

              {report.recommendations && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-1">Recommendations:</p>
                  <p className="text-green-800 text-sm">{report.recommendations}</p>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Created: {new Date(report.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
