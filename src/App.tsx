import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext, AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Papers from './pages/Papers'
import Hypotheses from './pages/Hypotheses'
import Experiments from './pages/Experiments'
import Reports from './pages/Reports'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" />
}

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/papers"
          element={
            <ProtectedRoute>
              <Layout>
                <Papers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hypotheses"
          element={
            <ProtectedRoute>
              <Layout>
                <Hypotheses />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/experiments"
          element={
            <ProtectedRoute>
              <Layout>
                <Experiments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
