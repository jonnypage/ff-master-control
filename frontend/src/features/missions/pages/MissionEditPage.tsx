import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Edit, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/features/auth/lib/auth-context';
import { TeamSelectionForMission } from '../components/TeamSelectionForMission';
import type { GetMissionQuery } from '@/lib/graphql/generated';

const GET_MISSION_QUERY = graphql(`
  query GetMission($id: ID!) {
    mission(id: $id) {
      _id
      name
      description
      creditsAwarded
      isFinalChallenge
      createdAt
      updatedAt
    }
  }
`);

const UPDATE_MISSION_MUTATION = graphql(`
  mutation UpdateMission($id: ID!, $input: UpdateMissionDto!) {
    updateMission(id: $id, input: $input) {
      _id
      name
      description
      creditsAwarded
      isFinalChallenge
      createdAt
      updatedAt
    }
  }
`);

const GET_TEAMS_FOR_MISSION_QUERY = graphql(`
  query GetTeamsForMission {
    teams {
      _id
      completedMissionIds
    }
  }
`);

export function MissionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { canEditMissions } = usePermissions();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if we're in edit mode based on URL path
  const isEditMode = location.pathname.endsWith('/edit');
  const canEdit = canEditMissions && isEditMode;
  const canCompleteMissions =
    user?.role === 'MISSION_LEADER' ||
    user?.role === 'ADMIN' ||
    user?.role === 'QUEST_GIVER';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creditsAwarded, setCreditsAwarded] = useState(0);
  const [isFinalChallenge, setIsFinalChallenge] = useState(false);

  const { data, isLoading } = useQuery<GetMissionQuery>({
    queryKey: ['mission', id],
    queryFn: () => graphqlClient.request(GET_MISSION_QUERY, { id: id! }),
    enabled: !!id,
  });

  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => graphqlClient.request(GET_TEAMS_FOR_MISSION_QUERY),
  });

  const completionCount = useMemo(() => {
    if (!teamsData?.teams || !id) return { completed: 0, total: 0 };
    const teams =
      (teamsData as { teams?: Array<{ completedMissionIds: string[] }> })
        ?.teams ?? [];
    const completed = teams.filter((team) =>
      team.completedMissionIds.includes(id),
    ).length;
    return { completed, total: teams.length };
  }, [teamsData, id]);

  // Initialize state from data - component resets when id changes
  const missionData = data?.mission;
  if (
    missionData &&
    (name !== missionData.name ||
      description !== (missionData.description || '') ||
      creditsAwarded !== missionData.creditsAwarded ||
      isFinalChallenge !== missionData.isFinalChallenge)
  ) {
    setName(missionData.name);
    setDescription(missionData.description || '');
    setCreditsAwarded(missionData.creditsAwarded);
    setIsFinalChallenge(missionData.isFinalChallenge);
  }

  const updateMission = useMutation({
    mutationFn: (input: {
      name?: string;
      description?: string;
      creditsAwarded?: number;
      isFinalChallenge?: boolean;
    }) =>
      graphqlClient.request(UPDATE_MISSION_MUTATION, {
        id: id!,
        input,
      }),
    onSuccess: () => {
      toast.success('Mission updated successfully');
      queryClient.invalidateQueries({ queryKey: ['mission', id] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { errors?: Array<{ message?: string }> } })
          ?.response?.errors?.[0]?.message || 'Failed to update mission';
      toast.error(errorMessage);
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Mission name is required');
      return;
    }

    const input: {
      name?: string;
      description?: string;
      creditsAwarded?: number;
      isFinalChallenge?: boolean;
    } = {};

    if (name !== data?.mission?.name) {
      input.name = name;
    }
    if (description !== (data?.mission?.description || '')) {
      input.description = description;
    }
    if (creditsAwarded !== data?.mission?.creditsAwarded) {
      input.creditsAwarded = creditsAwarded;
    }
    if (isFinalChallenge !== data?.mission?.isFinalChallenge) {
      input.isFinalChallenge = isFinalChallenge;
    }

    if (Object.keys(input).length === 0) {
      toast.info('No changes to save');
      return;
    }

    updateMission.mutate(input);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading mission...</p>
        </div>
      </div>
    );
  }

  if (!data?.mission) {
    return (
      <div className="space-y-4">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">Mission not found</p>
            <Button
              onClick={() => navigate('/missions')}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Missions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mission = data.mission;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/missions')}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                {isEditMode ? 'Edit Mission' : 'Mission Details'}
              </h1>
              {mission.isFinalChallenge && (
                <Badge variant="default">Final Challenge</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditMode
                ? 'Update mission information'
                : 'View mission information'}
            </p>
          </div>
        </div>
        {!isEditMode && canEditMissions && (
          <Button
            onClick={() => navigate(`/missions/${id}/edit`)}
            size="lg"
            className="shadow-md"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Mission Information</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Completed:
                </span>
                <Badge variant="outline">
                  {completionCount.completed}/{completionCount.total}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {canEdit ? (
              <>
                <div>
                  <Label
                    htmlFor="mission-name"
                    className="text-base font-semibold"
                  >
                    Mission Name
                  </Label>
                  <Input
                    id="mission-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter mission name"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="mission-description"
                    className="text-base font-semibold"
                  >
                    Description
                  </Label>
                  <Input
                    id="mission-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter mission description (optional)"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="credits-awarded"
                    className="text-base font-semibold"
                  >
                    Credits Awarded
                  </Label>
                  <Input
                    id="credits-awarded"
                    type="number"
                    value={creditsAwarded}
                    onChange={(e) =>
                      setCreditsAwarded(parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                </div>
                {isFinalChallenge && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-base px-3 py-1">
                        Final Challenge
                      </Badge>
                    </div>
                  </div>
                )}
                {!isFinalChallenge && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-final-challenge"
                      checked={isFinalChallenge}
                      onChange={(e) => setIsFinalChallenge(e.target.checked)}
                      className="rounded border-input"
                    />
                    <Label
                      htmlFor="is-final-challenge"
                      className="cursor-pointer"
                    >
                      Final Challenge
                    </Label>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <Label className="text-base font-semibold">
                    Mission Name
                  </Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {mission.name}
                  </div>
                </div>
                <div>
                  <Label className="text-base font-semibold">Description</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {mission.description || (
                      <span className="text-muted-foreground">
                        No description
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-base font-semibold">
                    Credits Awarded
                  </Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {mission.creditsAwarded}
                  </div>
                </div>
                {mission.isFinalChallenge && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-base px-3 py-1">
                        Final Challenge
                      </Badge>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {canEdit && (
          <div className="flex justify-end gap-3 pt-6 border-t bg-card p-4 rounded-lg shadow-sm -mx-4 -mb-4">
            <Button
              onClick={() => navigate(`/missions/${id}`)}
              variant="outline"
              size="lg"
              className="min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMission.isPending}
              size="lg"
              className="min-w-[120px] shadow-md"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMission.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* Team Selection and Completion Interface (only when not in edit mode and user can complete missions) */}
      {!isEditMode && canCompleteMissions && mission && (
        <div className="space-y-6 mt-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Mark Mission Complete
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a team to mark this mission as complete
            </p>
          </div>
          <TeamSelectionForMission
            missionId={mission._id}
            onTeamSelect={() => {}} // No-op since we're not navigating to detail view
          />
        </div>
      )}
    </div>
  );
}
