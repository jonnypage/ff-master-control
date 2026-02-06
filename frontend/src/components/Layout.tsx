import { Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/lib/auth-context';
import { Navigation } from './Navigation';

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, team, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} team={team} onLogout={logout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
