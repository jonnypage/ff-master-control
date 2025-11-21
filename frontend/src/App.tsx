import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/auth/lib/auth-context';
import { LoginPage } from './features/auth/components/LoginPage';
import { Dashboard } from './features/dashboard/Dashboard';
import { TeamsPage } from './features/teams/pages/TeamsPage';
import { TeamEditPage } from './features/teams/pages/TeamEditPage';
import { MissionsPage } from './features/missions/pages/MissionsPage';
import { MissionEditPage } from './features/missions/pages/MissionEditPage';
import { StorePage } from './features/store/pages/StorePage';
import { AdminPage } from './features/admin/pages/AdminPage';
import { Layout } from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="teams/:id" element={<TeamEditPage />} />
          <Route path="missions" element={<MissionsPage />} />
          <Route path="missions/:id" element={<MissionEditPage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
