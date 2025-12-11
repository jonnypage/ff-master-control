import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from 'react-router-dom';
import { useAuth } from './features/auth/lib/auth-context';
import { LoginPage } from './features/auth/components/LoginPage';
import { LeaderboardPage } from './features/leaderboard/pages/LeaderboardPage';
import { Dashboard } from './features/dashboard/Dashboard';
import { TeamsPage } from './features/teams/pages/TeamsPage';
import { TeamEditPage } from './features/teams/pages/TeamEditPage';
import { MissionsPage } from './features/missions/pages/MissionsPage';
import { MissionEditPage } from './features/missions/pages/MissionEditPage';
import { StorePage } from './features/store/pages/StorePage';
import { AdminPage } from './features/admin/pages/AdminPage';
import { Layout } from './components/Layout';

function TeamEditPageWrapper() {
  const { id } = useParams<{ id: string }>();
  return <TeamEditPage key={id} />;
}

function MissionEditPageWrapper() {
  const { id } = useParams<{ id: string }>();
  return <MissionEditPage key={id} />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LeaderboardPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />
        {/* Protected Routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:id/edit" element={<TeamEditPageWrapper />} />
          <Route path="/teams/:id" element={<TeamEditPageWrapper />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/missions/:id/edit" element={<MissionEditPageWrapper />} />
          <Route path="/missions/:id" element={<MissionEditPageWrapper />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
