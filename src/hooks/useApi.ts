import { useAuth } from './useAuth'

export function useApi() {
  const { session } = useAuth()

  const request = async (endpoint: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'API request failed')
    }

    return response.json()
  }

  return {
    get: (endpoint: string) => request(endpoint, { method: 'GET' }),
    post: (endpoint: string, body: unknown) =>
      request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint: string, body: unknown) =>
      request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
  }
}
