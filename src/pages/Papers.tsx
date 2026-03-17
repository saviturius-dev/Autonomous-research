import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { ExternalLink } from 'lucide-react'

interface Paper {
  id: string
  arxiv_id: string
  title: string
  abstract: string
  authors: string[]
  published_date: string
  pdf_url: string
}

export default function Papers() {
  const api = useApi()
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const data = await api.get('/api/papers')
        setPapers(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load papers:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPapers()
  }, [api])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Research Papers</h1>
        <p className="text-gray-600 mt-2">Browse and manage research papers from arXiv</p>
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
      ) : papers.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <p className="text-gray-600 text-lg">No papers available yet</p>
          <p className="text-gray-500 text-sm mt-2">Papers will appear here once they are added to the system</p>
        </div>
      ) : (
        <div className="space-y-4">
          {papers.map((paper) => (
            <div key={paper.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{paper.title}</h3>
                  {paper.abstract && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{paper.abstract}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {paper.authors.length > 0 && (
                      <span>{paper.authors.length} authors</span>
                    )}
                    {paper.published_date && (
                      <span>Published: {new Date(paper.published_date).toLocaleDateString()}</span>
                    )}
                    {paper.arxiv_id && (
                      <span>ArXiv: {paper.arxiv_id}</span>
                    )}
                  </div>
                </div>
                {paper.pdf_url && (
                  <a
                    href={paper.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0"
                  >
                    PDF <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
