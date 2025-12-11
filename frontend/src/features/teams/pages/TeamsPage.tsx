import { useState } from 'react';
import { TeamList } from '../components/TeamList';
import { CreateTeamDialog } from '../components/CreateTeamDialog';
import { useAuth } from '@/features/auth/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTeams } from '@/lib/api/useApi';

export function TeamsPage() {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  const { data: teams, isLoading, refetch } = useTeams();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teams</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage teams and track their progress
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        )}
      </div>

      <TeamList
        teams={teams?.teams || []}
        isLoading={isLoading}
        onUpdate={() => refetch()}
      />

      {isAdmin && (
        <CreateTeamDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
