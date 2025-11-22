import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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

const CHANGE_PASSWORD_MUTATION = graphql(`
  mutation ChangePassword($id: ID!, $input: ChangePasswordDto!) {
    changePassword(id: $id, input: $input)
  }
`);

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
  isOwnPassword: boolean;
  onSuccess?: () => void;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  userId,
  username,
  isOwnPassword,
  onSuccess,
}: ChangePasswordDialogProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const changePassword = useMutation({
    mutationFn: (input: { oldPassword?: string; newPassword: string }) =>
      graphqlClient.request(CHANGE_PASSWORD_MUTATION, {
        id: userId,
        input: {
          newPassword: input.newPassword,
          oldPassword: input.oldPassword,
        },
      }),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.errors?.[0]?.message || 'Failed to change password'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (isOwnPassword && !oldPassword) {
      toast.error('Old password is required');
      return;
    }

    changePassword.mutate({
      newPassword,
      oldPassword: isOwnPassword ? oldPassword : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            {isOwnPassword
              ? 'Enter your current password and choose a new one.'
              : `Change password for ${username}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {isOwnPassword && (
              <div>
                <Label htmlFor="old-password">Current Password *</Label>
                <Input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required={isOwnPassword}
                />
              </div>
            )}
            <div>
              <Label htmlFor="new-password">New Password *</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password *</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

