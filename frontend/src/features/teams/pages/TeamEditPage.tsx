import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Edit } from 'lucide-react';
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

const GET_MISSIONS_FOR_TEAM_EDIT_QUERY = graphql(`
  query GetMissionsForTeamEdit {
    missions {
      _id
      name
      description
      creditsAwarded
      isFinalChallenge
    }
  }
`);

const OVERRIDE_MISSION_COMPLETION_MUTATION = graphql(`
  mutation OverrideMissionCompletion($teamId: ID!, $missionId: ID!) {
    overrideMissionCompletion(teamId: $teamId, missionId: $missionId) {
      _id
      teamId
      missionId
    }
  }
`);

export function TeamEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { canEditTeams, canAdjustCredits } = usePermissions();
  const queryClient = useQueryClient();

  // Check if we're in edit mode based on URL path
  const isEditMode = location.pathname.endsWith('/edit');
  const canEdit = canEditTeams && isEditMode;

  const [name, setName] = useState('');
  const [nfcCardId, setNfcCardId] = useState('');

  const { data, isLoading } = useQuery<GetTeamByIdQuery>({
    queryKey: ['team', id],
    queryFn: () => graphqlClient.request(GET_TEAM_BY_ID_QUERY, { id: id! }),
    enabled: !!id,
  });

  const { data: missionsData } = useQuery({
    queryKey: ['missions'],
    // @ts-expect-error - GET_MISSIONS_FOR_TEAM_EDIT_QUERY types will be generated after running codegen
    queryFn: () => graphqlClient.request(GET_MISSIONS_FOR_TEAM_EDIT_QUERY),
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
        error.response?.errors?.[0]?.message || 'Failed to update team',
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
      toast.error(
        error.response?.errors?.[0]?.message || 'Failed to add credits',
      );
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
        error.response?.errors?.[0]?.message || 'Failed to remove credits',
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

  const overrideMissionCompletion = useMutation({
    mutationFn: (missionId: string) =>
      // @ts-expect-error - OVERRIDE_MISSION_COMPLETION_MUTATION types will be generated after running codegen
      graphqlClient.request(OVERRIDE_MISSION_COMPLETION_MUTATION, {
        teamId: id!,
        missionId,
      }),
    onSuccess: () => {
      toast.success('Mission completion updated');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.errors?.[0]?.message ||
          'Failed to update mission completion',
      );
    },
  });

  const handleMissionToggle = (missionId: string, isCompleted: boolean) => {
    if (!isCompleted) {
      // Complete the mission
      overrideMissionCompletion.mutate(missionId);
    } else {
      // Note: Unchecking would require a remove completion mutation
      // For now, we'll just show a message
      toast.info('To uncomplete a mission, please use the admin panel');
    }
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/teams')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Team' : 'Team Details'}
          </h1>
        </div>
        {!isEditMode && canEditTeams && (
          <Button onClick={() => navigate(`/teams/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {canEdit ? (
              <>
                <div>
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nfc-card-id">NFC Card ID</Label>
                  <Input
                    id="nfc-card-id"
                    value={nfcCardId}
                    onChange={(e) => setNfcCardId(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Team Name</Label>
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                    {team.name}
                  </div>
                </div>
                <div>
                  <Label>NFC Card ID</Label>
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-mono">
                    {team.nfcCardId}
                  </div>
                </div>
              </>
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
                /{missionsData?.missions?.length ?? 0}
              </Badge>
            </div>
            {canEdit && canAdjustCredits && (
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

        {canEdit && missionsData?.missions && (
          <Card>
            <CardHeader>
              <CardTitle>Missions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600 mb-4">
                Check off missions as complete for this team
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {missionsData.missions.map((mission: any) => {
                  const isCompleted = team.completedMissionIds?.includes(
                    mission._id,
                  );
                  return (
                    <div
                      key={mission._id}
                      className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                    >
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          type="checkbox"
                          id={`mission-${mission._id}`}
                          checked={isCompleted}
                          onChange={() =>
                            handleMissionToggle(mission._id, isCompleted)
                          }
                          disabled={overrideMissionCompletion.isPending}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`mission-${mission._id}`}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <span className="font-medium">{mission.name}</span>
                          {mission.isFinalChallenge && (
                            <Badge variant="default" className="text-xs">
                              Final
                            </Badge>
                          )}
                        </Label>
                        {mission.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {mission.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Credits: {mission.creditsAwarded}</span>
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {canEdit && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button onClick={() => navigate(`/teams/${id}`)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateTeam.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
