import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { UserRole } from '@/lib/graphql/generated'
import { LogOut, Users, Target, ShoppingCart, Settings, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'

interface NavigationProps {
  user: { username: string; role: UserRole } | null
  onLogout: () => void
}

export function Navigation({ user, onLogout }: NavigationProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isActive = (path: string) => location.pathname === path

  const canAccessStore = user?.role === 'STORE' || user?.role === 'ADMIN'
  const canAccessAdmin = user?.role === 'ADMIN'

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">
              Freedom Fighters
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:ml-8 md:space-x-1">
              <Link
                to="/teams"
                onClick={closeMobileMenu}
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
                onClick={closeMobileMenu}
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
                  onClick={closeMobileMenu}
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
                  onClick={closeMobileMenu}
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
          
          {/* Desktop User Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeToggle />
            <span className="text-sm font-medium text-foreground bg-muted px-3 py-1.5 rounded-lg">
              {user?.username} <span className="text-muted-foreground">({user?.role})</span>
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/teams"
                onClick={closeMobileMenu}
                className={`flex items-center px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive('/teams')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Users className="w-5 h-5 mr-3" />
                Teams
              </Link>
              <Link
                to="/missions"
                onClick={closeMobileMenu}
                className={`flex items-center px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive('/missions')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Target className="w-5 h-5 mr-3" />
                Missions
              </Link>
              {canAccessStore && (
                <Link
                  to="/store"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                    isActive('/store')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  Store
                </Link>
              )}
              {canAccessAdmin && (
                <Link
                  to="/admin"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Admin
                </Link>
              )}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="px-4 py-2 text-sm font-medium text-foreground">
                  {user?.username} <span className="text-muted-foreground">({user?.role})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    closeMobileMenu()
                    onLogout()
                  }}
                  className="w-full justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

