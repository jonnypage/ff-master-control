import { useEffect, useState } from 'react';
import { Download, Trophy } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { useLogin, useTeamLogin } from '@/lib/api/useApi';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

export function LoginPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'team' | 'staff'>('team');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser, loginTeam } = useAuth();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const loginMutation = useLogin();
  const teamLoginMutation = useTeamLogin();

  useEffect(() => {
    const maybeTeamCode = (location.state as { teamCode?: string } | null)
      ?.teamCode;
    if (maybeTeamCode) {
      setMode('team');
      setTeamCode(maybeTeamCode);
    }
  }, [location.state]);

  useEffect(() => {
    const fromQuery = searchParams.get('teamCode');
    if (fromQuery) {
      setMode('team');
      setTeamCode(fromQuery.toUpperCase());
    }
  }, [searchParams]);

  const handleInstall = async () => {
    await promptInstall();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (mode === 'team') {
      teamLoginMutation.mutate(
        { input: { teamCode, pin } },
        {
          onSuccess: (data) => {
            if (data.teamLogin) {
              loginTeam(data.teamLogin.access_token, data.teamLogin.team);
            }
          },
          onError: (err: unknown) => {
            const message =
              (err as { response?: { errors?: Array<{ message?: string }> } })
                ?.response?.errors?.[0]?.message || 'Login failed';
            setError(message);
          },
          onSettled: () => setIsLoading(false),
        },
      );
    } else {
      loginMutation.mutate(
        { input: { username, password } },
        {
          onSuccess: (data) => {
            if (data.login) {
              loginUser(data.login.access_token, data.login.user);
            }
          },
          onError: (err: unknown) => {
            const message =
              (err as { response?: { errors?: Array<{ message?: string }> } })
                ?.response?.errors?.[0]?.message || 'Login failed';
            setError(message);
          },
          onSettled: () => setIsLoading(false),
        },
      );
    }
  };

  return (
    <div className="login-page min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Freedom Fighters
          </h2>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            {mode === 'team' ? 'Join your team' : 'Staff sign in'}
          </p>

          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant={mode === 'team' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => {
                setMode('team');
                setError(null);
              }}
            >
              Team
            </Button>
            <Button
              type="button"
              variant={mode === 'staff' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => {
                setMode('staff');
                setError(null);
              }}
            >
              Staff
            </Button>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          {mode === 'team' ? (
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="teamCode" className="sr-only">
                  Team Code
                </label>
                <input
                  id="teamCode"
                  name="teamCode"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-input placeholder:text-muted-foreground text-foreground bg-background rounded-t-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:z-10 sm:text-sm"
                  placeholder="Team Code (8 chars)"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label htmlFor="pin" className="sr-only">
                  PIN
                </label>
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-input placeholder:text-muted-foreground text-foreground bg-background rounded-b-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:z-10 sm:text-sm"
                  placeholder="4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-input placeholder:text-muted-foreground text-foreground bg-background rounded-t-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-input placeholder:text-muted-foreground text-foreground bg-background rounded-b-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            <Link to="/team/create" className="mt-2 block">
              <Button type="button" variant="outline" className="w-full">
                Create a new team
              </Button>
            </Link>
            <Link to="/staffsignup" className="block">
              <Button type="button" variant="outline" className="w-full">
                Staff sign up
              </Button>
            </Link>
            <Link to="/leaderboard" className="block">
              <Button type="button" variant="outline" className="w-full">
                <Trophy className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>
            </Link>
          </div>
          {isInstallable && !isInstalled && (
            <div className="mt-4">
              <Button
                onClick={handleInstall}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
