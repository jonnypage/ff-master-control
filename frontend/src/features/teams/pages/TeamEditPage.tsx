import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/lib/auth-context';
import type { GetTeamByIdQuery } from '@/lib/graphql/generated';

const GET_TEAM_BY_ID_QUERY = graphql(`
  query GetTeamById($id: ID!) {
    teamById(id: $id) {
      _id
      name
      nfcCardId
      credits
      completedMissionIds
      createdAt
    }
  }
`);

const UPDATE_TEAM_MUTATION = graphql(`
  mutation UpdateTeam($id: ID!, $input: UpdateTeamDto!) {
    updateTeam(id: $id, input: $input) {
      _id
      name
      nfcCardId
      credits
      completedMissionIds
    }
  }
`);

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

export function TeamEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [nfcCardId, setNfcCardId] = useState('');

  const { data, isLoading } = useQuery<GetTeamByIdQuery>({
    queryKey: ['team', id],
    queryFn: () => graphqlClient.request(GET_TEAM_BY_ID_QUERY, { id: id! }),
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.teamById) {
      setName(data.teamById.name);
      setNfcCardId(data.teamById.nfcCardId);
    }
  }, [data]);

  const updateTeam = useMutation({
    mutationFn: (input: { name?: string; nfcCardId?: string }) =>
      graphqlClient.request(UPDATE_TEAM_MUTATION, {
        id: id!,
        input,
      }),
    onSuccess: () => {
      toast.success('Team updated successfully');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.errors?.[0]?.message || 'Failed to update team'
      );
    },
  });

  const addCredits = useMutation({
    mutationFn: (amount: number) =>
      graphqlClient.request(ADD_CREDITS_MUTATION, {
        nfcCardId: data?.teamById?.nfcCardId || '',
        amount,
      }),
    onSuccess: () => {
      toast.success('Credits added successfully');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.errors?.[0]?.message || 'Failed to add credits');
    },
  });

  const removeCredits = useMutation({
    mutationFn: (amount: number) =>
      graphqlClient.request(REMOVE_CREDITS_MUTATION, {
        nfcCardId: data?.teamById?.nfcCardId || '',
        amount,
      }),
    onSuccess: () => {
      toast.success('Credits removed successfully');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.errors?.[0]?.message || 'Failed to remove credits'
      );
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Team name is required');
      return;
    }

    const input: { name?: string; nfcCardId?: string } = {};
    if (name !== data?.teamById?.name) {
      input.name = name;
    }
    if (nfcCardId !== data?.teamById?.nfcCardId) {
      input.nfcCardId = nfcCardId;
    }

    if (Object.keys(input).length === 0) {
      toast.info('No changes to save');
      return;
    }

    updateTeam.mutate(input);
  };

  const handleAddCredits = () => {
    addCredits.mutate(100);
  };

  const handleRemoveCredits = () => {
    removeCredits.mutate(100);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-8 text-gray-500">Loading team...</div>
      </div>
    );
  }

  if (!data?.teamById) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-8 text-gray-500">Team not found</div>
        <Button onClick={() => navigate('/teams')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Button>
      </div>
    );
  }

  const team = data.teamById;

  // Ensure we have valid data
  if (!team) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-8 text-gray-500">Loading team...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={() => navigate('/teams')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Team</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
            <div>
              <Label htmlFor="nfc-card-id">NFC Card ID</Label>
              <Input
                id="nfc-card-id"
                value={nfcCardId}
                onChange={(e) => setNfcCardId(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
            {isAdmin && (
              <Button
                onClick={handleSave}
                disabled={updateTeam.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Credits:</span>
              <Badge variant="secondary" className="text-lg font-semibold">
                {typeof team.credits === 'number' ? team.credits : 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Missions Completed:</span>
              <Badge>
                {team.completedMissionIds ? team.completedMissionIds.length : 0}
              </Badge>
            </div>
            {isAdmin && (
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  onClick={handleAddCredits}
                  disabled={addCredits.isPending || removeCredits.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add 100
                </Button>
                <Button
                  onClick={handleRemoveCredits}
                  disabled={addCredits.isPending || removeCredits.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-1" />
                  Remove 100
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

