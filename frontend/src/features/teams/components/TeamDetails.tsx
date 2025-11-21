import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { useAuth } from '@/features/auth/lib/auth-context';
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import type { SearchTeamQuery } from '@/lib/graphql/generated';

const ADD_CREDITS_MUTATION = graphql(`
  mutation AddCredits($nfcCardId: String!, $amount: Int!) {
    addCredits(nfcCardId: $nfcCardId, amount: $amount) {
      _id
      name
      nfcCardId
      credits
      completedMissionIds
    }
  }
`);

const REMOVE_CREDITS_MUTATION = graphql(`
  mutation RemoveCredits($nfcCardId: String!, $amount: Int!) {
    removeCredits(nfcCardId: $nfcCardId, amount: $amount) {
      _id
      name
      nfcCardId
      credits
      completedMissionIds
    }
  }
`);

interface TeamDetailsProps {
  team: SearchTeamQuery['searchTeam'];
  onUpdate?: () => void;
}

export function TeamDetails({ team, onUpdate }: TeamDetailsProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const addCredits = useMutation({
    mutationFn: (amount: number) =>
      graphqlClient.request(ADD_CREDITS_MUTATION, {
        nfcCardId: team!.nfcCardId,
        amount,
      }),
    onSuccess: () => {
      toast.success(`Added 100 credits to ${team!.name}`);
      queryClient.invalidateQueries({ queryKey: ['team', team!.nfcCardId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      onUpdate?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.errors?.[0]?.message || 'Failed to add credits',
      );
    },
  });

  const removeCredits = useMutation({
    mutationFn: (amount: number) =>
      graphqlClient.request(REMOVE_CREDITS_MUTATION, {
        nfcCardId: team!.nfcCardId,
        amount,
      }),
    onSuccess: () => {
      toast.success(`Removed 100 credits from ${team!.name}`);
      queryClient.invalidateQueries({ queryKey: ['team', team!.nfcCardId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      onUpdate?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.errors?.[0]?.message || 'Failed to remove credits',
      );
    },
  });

  if (!team) return null;

  const handleAddCredits = () => {
    addCredits.mutate(100);
  };

  const handleRemoveCredits = () => {
    removeCredits.mutate(100);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">NFC Card ID:</span>
          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {team.nfcCardId}
          </code>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Credits:</span>
          <Badge variant="secondary" className="text-lg font-semibold">
            {team.credits}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Missions Completed:</span>
          <Badge>{team.completedMissionIds.length}</Badge>
        </div>
        {isAdmin && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={handleAddCredits}
              disabled={addCredits.isPending || removeCredits.isPending}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add 100
            </Button>
            <Button
              onClick={handleRemoveCredits}
              disabled={addCredits.isPending || removeCredits.isPending}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Minus className="w-4 h-4 mr-1" />
              Remove 100
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
