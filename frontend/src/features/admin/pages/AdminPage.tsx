import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/lib/auth-context';
import { UserList } from '../components/UserList';
import { CreateUserDialog } from '../components/CreateUserDialog';
import { EditUserDialog } from '../components/EditUserDialog';
import type { GetUsersQuery } from '@/lib/graphql/generated';
import { useDeleteUser, useDeleteAllTeams } from '@/lib/api/useApi';

export function AdminPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<
    GetUsersQuery['users'][number] | null
  >(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showDeleteAllTeamsDialog, setShowDeleteAllTeamsDialog] =
    useState(false);

  const deleteUser = useDeleteUser();

  const handleEdit = (user: GetUsersQuery['users'][number]) => {
    setEditingUser(user);
  };

  const handleDelete = (userId: string) => {
    setDeletingUserId(userId);
  };

  const confirmDelete = () => {
    if (deletingUserId) {
      deleteUser.mutate(
        { id: deletingUserId },
        {
          onSuccess: () => {
            toast.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setDeletingUserId(null);
          },
          onError: (error: unknown) => {
            const message =
              (error as { response?: { errors?: Array<{ message?: string }> } })
                ?.response?.errors?.[0]?.message || 'Failed to delete user';
            toast.error(message);
          },
        },
      );
    }
  };

  const deleteAllTeams = useDeleteAllTeams();

  const confirmDeleteAllTeams = () => {
    deleteAllTeams.mutate(undefined, {
      onSuccess: () => {
        toast.success('All teams deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        queryClient.invalidateQueries({ queryKey: ['teams-for-store'] });
        queryClient.invalidateQueries({ queryKey: ['leaderboard-teams'] });
        queryClient.invalidateQueries({
          queryKey: ['teams-for-mission-completion'],
        });
        queryClient.invalidateQueries({ queryKey: ['my-team'] });
        setShowDeleteAllTeamsDialog(false);
      },
      onError: (error: unknown) => {
        const message =
          (error as { response?: { errors?: Array<{ message?: string }> } })
            ?.response?.errors?.[0]?.message || 'Failed to delete all teams';
        toast.error(message);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage users and administrative settings
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          size="lg"
          className="sm:shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      {currentUser?.role === 'ADMIN' && (
        <details className="rounded-lg border border-border bg-card">
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-foreground">
            Game Admin
          </summary>
          <div className="px-4 pb-4">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-destructive flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Reset Game
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all teams, including credits and
                  mission completions. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteAllTeamsDialog(true)}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Delete All Teams
                </Button>
              </CardContent>
            </Card>
          </div>
        </details>
      )}

      <UserList
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentUserId={currentUser?._id}
      />

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
        }}
      />

      <EditUserDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
        onSuccess={() => {
          setEditingUser(null);
        }}
      />

      <Dialog
        open={!!deletingUserId}
        onOpenChange={(open) => !open && setDeletingUserId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingUserId(null)}
              disabled={deleteUser.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteAllTeamsDialog}
        onOpenChange={setShowDeleteAllTeamsDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Teams</DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to delete ALL teams? This will
              permanently remove all team data, including credits and mission
              completions. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteAllTeamsDialog(false)}
              disabled={deleteAllTeams.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAllTeams}
              disabled={deleteAllTeams.isPending}
            >
              {deleteAllTeams.isPending ? 'Deleting...' : 'Delete All Teams'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
