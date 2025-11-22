import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { TeamList } from '../components/TeamList';
import { CreateTeamDialog } from '../components/CreateTeamDialog';
import { useAuth } from '@/features/auth/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const GET_TEAMS_QUERY = graphql(`
  query GetTeams {
    teams {
      _id
      name
      nfcCardId
      credits
      completedMissionIds
      createdAt
    }
  }
`);

export function TeamsPage() {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  const {
    data: teams,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['teams'],
    queryFn: () => graphqlClient.request(GET_TEAMS_QUERY),
  });

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
