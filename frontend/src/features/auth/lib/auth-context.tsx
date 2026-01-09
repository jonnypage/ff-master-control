import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { setAuthToken } from '@/lib/graphql/client';
import type { UserRole } from '@/lib/graphql/generated';

interface User {
  _id: string;
  username: string;
  role: UserRole;
}

interface Team {
  _id: string;
  name: string;
  teamCode: string;
  teamGuid: string;
  image?: { url?: string | null } | null;
}

interface AuthContextType {
  user: User | null;
  team: Team | null;
  token: string | null;
  loginUser: (token: string, user: User) => void;
  loginTeam: (token: string, team: Team) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'ff_auth_token';
const PRINCIPAL_TYPE_KEY = 'ff_principal_type';
const USER_KEY = 'ff_user';
const TEAM_KEY = 'ff_team';

function getInitialAuth() {
  const savedToken = localStorage.getItem(TOKEN_KEY);
  const principalType = localStorage.getItem(PRINCIPAL_TYPE_KEY);
  const savedUser = localStorage.getItem(USER_KEY);
  const savedTeam = localStorage.getItem(TEAM_KEY);

  if (savedToken && principalType === 'user' && savedUser) {
    return { token: savedToken, user: JSON.parse(savedUser) as User, team: null };
  }

  if (savedToken && principalType === 'team' && savedTeam) {
    return { token: savedToken, user: null, team: JSON.parse(savedTeam) as Team };
  }

  return { token: null, user: null, team: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialState = getInitialAuth();
  const [token, setToken] = useState<string | null>(initialState.token);
  const [user, setUser] = useState<User | null>(initialState.user);
  const [team, setTeam] = useState<Team | null>(initialState.team);

  // Set auth token in GraphQL client when token is available
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    } else {
      setAuthToken(null);
    }
  }, [token]);

  const loginUser = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setTeam(null);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(PRINCIPAL_TYPE_KEY, 'user');
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    localStorage.removeItem(TEAM_KEY);
    setAuthToken(newToken);
  };

  const loginTeam = (newToken: string, newTeam: Team) => {
    setToken(newToken);
    setTeam(newTeam);
    setUser(null);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(PRINCIPAL_TYPE_KEY, 'team');
    localStorage.setItem(TEAM_KEY, JSON.stringify(newTeam));
    localStorage.removeItem(USER_KEY);
    setAuthToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTeam(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PRINCIPAL_TYPE_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TEAM_KEY);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        team,
        token,
        loginUser,
        loginTeam,
        logout,
        isAuthenticated: !!token && (!!user || !!team),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
