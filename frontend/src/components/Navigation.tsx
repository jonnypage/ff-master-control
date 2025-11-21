import { Link, useLocation } from 'react-router-dom'
import type { UserRole } from '@/lib/graphql/generated'
import { LogOut, Users, Target, ShoppingCart, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavigationProps {
  user: { username: string; role: UserRole } | null
  onLogout: () => void
}

export function Navigation({ user, onLogout }: NavigationProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const canAccessStore = user?.role === 'STORE' || user?.role === 'ADMIN'
  const canAccessAdmin = user?.role === 'ADMIN'

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-semibold text-gray-900">
              Freedom Fighters
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/teams"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/teams')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Teams
              </Link>
              <Link
                to="/missions"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/missions')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Target className="w-4 h-4 mr-2" />
                Missions
              </Link>
              {canAccessStore && (
                <Link
                  to="/store"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/store')
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Store
                </Link>
              )}
              {canAccessAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin')
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.username} ({user?.role})
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

