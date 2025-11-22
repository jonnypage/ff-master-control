import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/lib/auth-context';
import { UserList } from '../components/UserList';
import { CreateUserDialog } from '../components/CreateUserDialog';
import { EditUserDialog } from '../components/EditUserDialog';
import type { GetUsersQuery } from '@/lib/graphql/generated';

const DELETE_USER_MUTATION = graphql(`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`);

const DELETE_ALL_TEAMS_MUTATION = graphql(`
  mutation DeleteAllTeams {
    deleteAllTeams
  }
`);

export function AdminPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] =
    useState<GetUsersQuery['users'][number] | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showDeleteAllTeamsDialog, setShowDeleteAllTeamsDialog] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const deleteUser = useMutation({
    mutationFn: (id: string) =>
      graphqlClient.request(DELETE_USER_MUTATION, { id }),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingUserId(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.errors?.[0]?.message || 'Failed to delete user'
      );
    },
  });

  const handleEdit = (user: GetUsersQuery['users'][number]) => {
    setEditingUser(user);
  };

  const handleDelete = (userId: string) => {
    setDeletingUserId(userId);
  };

  const confirmDelete = () => {
    if (deletingUserId) {
      deleteUser.mutate(deletingUserId);
    }
  };

  const deleteAllTeams = useMutation({
    mutationFn: () => graphqlClient.request(DELETE_ALL_TEAMS_MUTATION),
    onSuccess: () => {
      toast.success('All teams deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowDeleteAllTeamsDialog(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.errors?.[0]?.message || 'Failed to delete all teams'
      );
    },
  });

  const confirmDeleteAllTeams = () => {
    deleteAllTeams.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage users and administrative settings
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      <UserList
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentUserId={currentUser?._id}
        onSearchChange={setUserSearchTerm}
        onDeleteAllTeams={() => setShowDeleteAllTeamsDialog(true)}
        showDeleteAllTeams={userSearchTerm.toLowerCase() === 'delete'}
        isAdmin={currentUser?.role === 'ADMIN'}
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

      <Dialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
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
              Are you absolutely sure you want to delete ALL teams? This will permanently remove all team data, including credits and mission completions. This action cannot be undone.
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

