import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Save,
  Plus,
  Minus,
  CheckCircle2,
  Radio,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Edit } from 'lucide-react';
import { useNFCReader } from '@/hooks/useNFCReader';
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

const REMOVE_MISSION_COMPLETION_MUTATION = graphql(`
  mutation RemoveMissionCompletion($teamId: ID!, $missionId: ID!) {
    removeMissionCompletion(teamId: $teamId, missionId: $missionId)
  }
`);

export function TeamEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { canEditTeams, canAdjustCredits } = usePermissions();
  const queryClient = useQueryClient();
  const { isSupported, isReading, readNFC, checkSupport } = useNFCReader();

  // Check if we're in edit mode based on URL path
  const isEditMode = location.pathname.endsWith('/edit');
  const canEdit = canEditTeams && isEditMode;

  const { data, isLoading } = useQuery<GetTeamByIdQuery>({
    queryKey: ['team', id],
    queryFn: () => graphqlClient.request(GET_TEAM_BY_ID_QUERY, { id: id! }),
    enabled: !!id,
  });

  const { data: missionsData } = useQuery({
    queryKey: ['missions'],
    queryFn: () => graphqlClient.request(GET_MISSIONS_FOR_TEAM_EDIT_QUERY),
  });

  // Initialize state from data - component resets when id changes (via key in App.tsx)
  const teamData = data?.teamById;
  const [name, setName] = useState(() => teamData?.name ?? '');
  const [nfcCardId, setNfcCardId] = useState(() => teamData?.nfcCardId ?? '');

  // Update state when data loads for the current team
  // Component resets when id changes, so we only need to sync when data becomes available
  if (
    teamData &&
    (name !== teamData.name || nfcCardId !== teamData.nfcCardId)
  ) {
    setName(teamData.name);
    setNfcCardId(teamData.nfcCardId);
  }

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

  const handleNFCScan = async () => {
    if (!isSupported) {
      checkSupport();
      if (!isSupported) {
        toast.error('NFC is not supported on this device');
        return;
      }
    }

    const result = await readNFC();
    if (result.success && result.nfcId) {
      setNfcCardId(result.nfcId);
      toast.success('NFC card scanned successfully!');
    } else {
      toast.error(result.error || 'Failed to read NFC card');
    }
  };

  const overrideMissionCompletion = useMutation({
    mutationFn: (missionId: string) =>
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

  const removeMissionCompletion = useMutation({
    mutationFn: (missionId: string) =>
      graphqlClient.request(REMOVE_MISSION_COMPLETION_MUTATION as any, {
        teamId: id!,
        missionId,
      }),
    onSuccess: () => {
      toast.success('Mission completion removed');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.errors?.[0]?.message ||
          'Failed to remove mission completion',
      );
    },
  });

  const handleMissionToggle = (missionId: string, isCompleted: boolean) => {
    if (!isCompleted) {
      // Complete the mission
      overrideMissionCompletion.mutate(missionId);
    } else {
      // Remove the mission completion
      removeMissionCompletion.mutate(missionId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading team...</p>
        </div>
      </div>
    );
  }

  if (!data?.teamById) {
    return (
      <div className="space-y-4">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">Team not found</p>
            <Button
              onClick={() => navigate('/teams')}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const team = data.teamById;

  // Ensure we have valid data
  if (!team) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/teams')}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditMode ? 'Edit Team' : 'Team Details'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditMode ? 'Update team information' : 'View team information'}
            </p>
          </div>
        </div>
        {!isEditMode && canEditTeams && (
          <Button
            onClick={() => navigate(`/teams/${id}/edit`)}
            size="lg"
            className="shadow-md"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <div className="max-w-3xl space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-xl">Team Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
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
                  <div className="flex gap-2">
                    <Input
                      id="nfc-card-id"
                      value={nfcCardId}
                      onChange={(e) => setNfcCardId(e.target.value)}
                      className="flex-1"
                    />
                    {isSupported && (
                      <Button
                        type="button"
                        onClick={handleNFCScan}
                        disabled={isReading}
                        variant="outline"
                      >
                        <Radio className="w-4 h-4 mr-2" />
                        {isReading ? 'Scanning...' : 'Scan'}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Team Name</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {team.name}
                  </div>
                </div>
                <div>
                  <Label>NFC Card ID</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
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
              <span className="text-sm text-muted-foreground">Credits:</span>
              <Badge variant="secondary" className="text-lg font-semibold">
                {typeof team.credits === 'number' ? team.credits : 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Missions Completed:
              </span>
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
              <p className="text-sm text-muted-foreground mb-4">
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
                      className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50"
                    >
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          type="checkbox"
                          id={`mission-${mission._id}`}
                          checked={isCompleted}
                          onChange={() =>
                            handleMissionToggle(mission._id, isCompleted)
                          }
                          disabled={
                            overrideMissionCompletion.isPending ||
                            removeMissionCompletion.isPending
                          }
                          className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
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
                          <p className="text-sm text-muted-foreground mt-1">
                            {mission.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
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
