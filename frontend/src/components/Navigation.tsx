import { Link, useLocation } from 'react-router-dom'
import type { UserRole } from '@/lib/graphql/generated'
import { LogOut, Users, Target, ShoppingCart, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'

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
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary">
              Freedom Fighters
            </Link>
            <div className="flex space-x-1">
              <Link
                to="/teams"
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/teams')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Teams
              </Link>
              <Link
                to="/missions"
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/missions')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Target className="w-4 h-4 mr-2" />
                Missions
              </Link>
              {canAccessStore && (
                <Link
                  to="/store"
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/store')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Store
                </Link>
              )}
              {canAccessAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-sm font-medium text-foreground bg-muted px-3 py-1.5 rounded-lg">
              {user?.username} <span className="text-muted-foreground">({user?.role})</span>
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

