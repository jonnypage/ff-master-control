import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { Key } from 'lucide-react';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import type { UserRole } from '@/lib/graphql/generated';
import { useUpdateUser } from '@/lib/api/useApi';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    _id: string;
    username: string;
    role: UserRole;
  } | null;
  onSuccess: () => void;
}

const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MISSION_LEADER', label: 'Mission Leader' },
  { value: 'QUEST_GIVER', label: 'Quest Giver' },
  { value: 'STORE', label: 'Store' },
];

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserDialogProps) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('MISSION_LEADER');
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setRole(user.role);
    }
  }, [user]);

  const updateUser = useUpdateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    const updates: { username?: string; role?: UserRole } = {};
    if (username.trim() !== user?.username) {
      updates.username = username.trim();
    }
    if (role !== user?.role) {
      updates.role = role;
    }

    if (Object.keys(updates).length === 0) {
      toast.info('No changes to save');
      return;
    }

    updateUser.mutate(
      { id: user!._id, input: updates },
      {
        onSuccess: () => {
          toast.success('User updated successfully!');
          queryClient.invalidateQueries({ queryKey: ['users'] });
          onSuccess();
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message || 'Failed to update user';
          toast.error(message);
        },
      },
    );
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Password changes are handled separately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-username">Username *</Label>
              <Input
                id="edit-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role *</Label>
              <select
                id="edit-role"
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
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowChangePassword(true)}
                className="w-full"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
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
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {user && (
        <ChangePasswordDialog
          open={showChangePassword}
          onOpenChange={setShowChangePassword}
          userId={user._id}
          username={user.username}
          isOwnPassword={false}
        />
      )}
    </Dialog>
  );
}

