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
import { MyTeamPage } from './features/teams/pages/MyTeamPage';
import { CreateTeamPage } from './features/teams/pages/CreateTeamPage';
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

function UserOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated, user, team } = useAuth();
  const postLoginPath = user ? '/dashboard' : team ? '/team' : '/';

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LeaderboardPage />} />
        <Route path="/team/create" element={<CreateTeamPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={postLoginPath} replace />
            ) : (
              <LoginPage />
            )
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
          <Route
            path="dashboard"
            element={
              <UserOnlyRoute>
                <Dashboard />
              </UserOnlyRoute>
            }
          />
          <Route path="team" element={<MyTeamPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route
            path="teams/:id/edit"
            element={
              <UserOnlyRoute>
                <TeamEditPageWrapper />
              </UserOnlyRoute>
            }
          />
          <Route path="teams/:id" element={<TeamEditPageWrapper />} />
          <Route path="missions" element={<MissionsPage />} />
          <Route
            path="missions/:id/edit"
            element={
              <UserOnlyRoute>
                <MissionEditPageWrapper />
              </UserOnlyRoute>
            }
          />
          <Route path="missions/:id" element={<MissionEditPageWrapper />} />
          <Route
            path="store"
            element={
              <UserOnlyRoute>
                <StorePage />
              </UserOnlyRoute>
            }
          />
          <Route
            path="admin"
            element={
              <UserOnlyRoute>
                <AdminPage />
              </UserOnlyRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
