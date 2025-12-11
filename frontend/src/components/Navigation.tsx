import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import type { UserRole } from '@/lib/graphql/generated';
import {
  LogOut,
  Users,
  Target,
  ShoppingCart,
  Settings,
  Key,
  Menu,
  X,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { ChangePasswordDialog } from '@/features/admin/components/ChangePasswordDialog';

interface NavigationProps {
  user: { _id: string; username: string; role: UserRole } | null;
  onLogout: () => void;
}

export function Navigation({ user, onLogout }: NavigationProps) {
  const location = useLocation();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  const canAccessTeams = user?.role === 'ADMIN' || user?.role === 'QUEST_GIVER';
  const canAccessMissions =
    user?.role === 'MISSION_LEADER' ||
    user?.role === 'ADMIN' ||
    user?.role === 'QUEST_GIVER';
  const canAccessStore = user?.role === 'STORE' || user?.role === 'ADMIN';
  const canAccessAdmin = user?.role === 'ADMIN';

  const navLinks = (
    <>
      <Link
        to="/"
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/')
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Trophy className="w-4 h-4 mr-2" />
        Leaderboard
      </Link>
      {canAccessTeams && (
        <Link
          to="/teams"
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive('/teams')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Teams
        </Link>
      )}
      {canAccessMissions && (
        <Link
          to="/missions"
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive('/missions')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <Target className="w-4 h-4 mr-2" />
          Missions
        </Link>
      )}
      {canAccessStore && (
        <Link
          to="/store"
          onClick={() => setMobileMenuOpen(false)}
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
          onClick={() => setMobileMenuOpen(false)}
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
    </>
  );

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-primary">
              Freedom Fighters
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:ml-8 md:space-x-1">
              {navLinks}
            </div>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChangePassword(true)}
              title="Change password"
            >
              <Key className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-foreground bg-muted px-3 py-1.5 rounded-lg">
              {user?.username}{' '}
              <span className="text-muted-foreground">({user?.role})</span>
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks}
              <div className="pt-4 border-t border-border space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowChangePassword(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <div className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-lg">
                  {user?.username}{' '}
                  <span className="text-muted-foreground">({user?.role})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {user && (
        <ChangePasswordDialog
          open={showChangePassword}
          onOpenChange={setShowChangePassword}
          userId={user._id}
          username={user.username}
          isOwnPassword={true}
        />
      )}
    </nav>
  );
}
