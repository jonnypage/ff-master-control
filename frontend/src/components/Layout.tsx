import { Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/lib/auth-context';
import { Navigation } from './Navigation';

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} onLogout={logout} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
