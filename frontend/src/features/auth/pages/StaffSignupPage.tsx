import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { UserRole } from '@/lib/graphql/generated';
import { useStaffSignup } from '@/lib/api/useApi';

const STAFF_ROLES: { value: UserRole; label: string }[] = [
  { value: 'MISSION_LEADER', label: 'Mission Leader' },
  { value: 'QUEST_GIVER', label: 'Quest Giver' },
  { value: 'STORE', label: 'Store' },
];

export function StaffSignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState<UserRole>('MISSION_LEADER');
  const [success, setSuccess] = useState(false);

  const staffSignup = useStaffSignup();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!password) {
      toast.error('Password is required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    staffSignup.mutate(
      {
        input: {
          username: username.trim(),
          password,
          role,
        },
      },
      {
        onSuccess: () => {
          setSuccess(true);
          toast.success('Staff account created. You can sign in now.');
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message || 'Failed to create account';
          toast.error(message);
        },
      },
    );
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Account created</CardTitle>
            <CardDescription>
              Your staff account is ready. Sign in with your username and password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Staff sign up</CardTitle>
          <CardDescription>
            Create a Mission Leader, Quest Giver, or Store account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="staff-username">Username *</Label>
              <Input
                id="staff-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="staff-password">Password *</Label>
              <Input
                id="staff-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="staff-password-confirm">Confirm password *</Label>
              <Input
                id="staff-password-confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="staff-role">Role *</Label>
              <select
                id="staff-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                {STAFF_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" disabled={staffSignup.isPending} className="w-full">
                {staffSignup.isPending ? 'Creating account...' : 'Create account'}
              </Button>
              <Button type="button" variant="outline" asChild className="w-full">
                <Link to="/">Back to sign in</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
