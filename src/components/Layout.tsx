import { Link, useNavigate } from 'react-router-dom'
import { Menu, Hop as Home, FileText, Lightbulb, Beaker, FileCheck, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/papers', label: 'Papers', icon: FileText },
    { href: '/hypotheses', label: 'Hypotheses', icon: Lightbulb },
    { href: '/experiments', label: 'Experiments', icon: Beaker },
    { href: '/reports', label: 'Reports', icon: FileCheck },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && <h1 className="text-xl font-bold">Literature Agent</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-700 p-4">
          {sidebarOpen && (
            <div className="mb-4 text-sm text-gray-300">
              <p className="truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
