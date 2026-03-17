import { createContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const sessionData = localStorage.getItem('session')

    if (token && sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData)
        setSession(parsedSession)
        setUser(parsedSession.user)
      } catch (err) {
        console.error('Failed to restore session:', err)
        localStorage.removeItem('access_token')
        localStorage.removeItem('session')
      }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const { session: newSession } = await response.json()
    setSession(newSession)
    setUser(newSession.user)
    localStorage.setItem('access_token', newSession.access_token)
    localStorage.setItem('session', JSON.stringify(newSession))
  }

  const signup = async (email: string, password: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Signup failed')
    }

    const { user: newUser } = await response.json()

    const loginResponse = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const { session: newSession } = await loginResponse.json()
    setSession(newSession)
    setUser(newSession.user)
    localStorage.setItem('access_token', newSession.access_token)
    localStorage.setItem('session', JSON.stringify(newSession))
  }

  const logout = async () => {
    setUser(null)
    setSession(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('session')
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
