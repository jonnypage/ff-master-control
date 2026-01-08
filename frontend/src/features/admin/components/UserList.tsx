import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Edit, Trash2, User as UserIcon, AlertTriangle } from 'lucide-react';
import type { GetUsersQuery } from '@/lib/graphql/generated';
import { useUsers } from '@/lib/api/useApi';

interface UserListProps {
  onEdit: (user: GetUsersQuery['users'][number]) => void;
  onDelete: (userId: string) => void;
  currentUserId?: string;
  onSearchChange?: (searchTerm: string) => void;
  onDeleteAllTeams?: () => void;
  showDeleteAllTeams?: boolean;
  isAdmin?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MISSION_LEADER: 'Mission Leader',
  QUEST_GIVER: 'Quest Giver',
  STORE: 'Store',
};

const ROLE_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  ADMIN: 'default',
  MISSION_LEADER: 'secondary',
  QUEST_GIVER: 'secondary',
  STORE: 'outline',
};

export function UserList({ onEdit, onDelete, currentUserId, onSearchChange, onDeleteAllTeams, showDeleteAllTeams, isAdmin }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useUsers();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const filteredUsers = useMemo(() => {
    const allUsers = (data?.users ?? []) as GetUsersQuery['users'];
    if (!searchTerm.trim()) return allUsers;

    const searchLower = searchTerm.toLowerCase();
    return allUsers.filter(
      (user: GetUsersQuery['users'][number]) =>
        user.username.toLowerCase().includes(searchLower) ||
        ROLE_LABELS[user.role]?.toLowerCase().includes(searchLower),
    );
  }, [data?.users, searchTerm]);

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  if ((!data?.users || data.users.length === 0) && !showDeleteAllTeams) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <UserIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">No users found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first user to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search users by username or role..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {showDeleteAllTeams && onDeleteAllTeams && isAdmin && (
          <Card className="hover:shadow-lg transition-all duration-200 border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-destructive flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Delete All Teams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This will permanently delete all teams, including credits and mission completions.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteAllTeams}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Teams
              </Button>
            </CardContent>
          </Card>
        )}
        {filteredUsers.map((user: GetUsersQuery['users'][number]) => (
          <Card key={user._id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">{user.username}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Role
                </span>
                <Badge
                  variant={ROLE_VARIANTS[user.role] || 'secondary'}
                  className="text-sm font-semibold px-3 py-1"
                >
                  {ROLE_LABELS[user.role] || user.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="pt-3 border-t border-border flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(user)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {currentUserId !== user._id && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(user._id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && searchTerm && !showDeleteAllTeams && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">No users found</p>
            <p className="text-sm text-muted-foreground mt-1">
              No users matching "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

