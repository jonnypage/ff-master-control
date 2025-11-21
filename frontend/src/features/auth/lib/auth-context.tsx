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

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'ff_auth_token';
const USER_KEY = 'ff_user';

function getInitialAuth() {
  const savedToken = localStorage.getItem(TOKEN_KEY);
  const savedUser = localStorage.getItem(USER_KEY);

  if (savedToken && savedUser) {
    return {
      token: savedToken,
      user: JSON.parse(savedUser) as User,
    };
  }

  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialState = getInitialAuth();
  const [token, setToken] = useState<string | null>(initialState.token);
  const [user, setUser] = useState<User | null>(initialState.user);

  // Set auth token in GraphQL client when token is available
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    } else {
      setAuthToken(null);
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setAuthToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
