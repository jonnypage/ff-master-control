import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { UserRole } from '@/lib/graphql/generated';

const CREATE_USER_MUTATION = graphql(`
  mutation CreateUser($input: CreateUserDto!) {
    createUser(input: $input) {
      _id
      username
      role
      createdAt
    }
  }
`);

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MISSION_LEADER', label: 'Mission Leader' },
  { value: 'STORE', label: 'Store' },
];

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState<UserRole>('MISSION_LEADER');

  const createUser = useMutation({
    mutationFn: (input: {
      username: string;
      password: string;
      role: UserRole;
    }) => graphqlClient.request(CREATE_USER_MUTATION, { input }),
    onSuccess: () => {
      toast.success('User created successfully!');
      setUsername('');
      setPassword('');
      setPasswordConfirm('');
      setRole('MISSION_LEADER');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.errors?.[0]?.message || 'Failed to create user'
      );
    },
  });

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
    if (password !== passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    createUser.mutate({
      username: username.trim(),
      password,
      role,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account with username, password, and role
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="password-confirm">Confirm Password *</Label>
              <Input
                id="password-confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm password"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                {USER_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

