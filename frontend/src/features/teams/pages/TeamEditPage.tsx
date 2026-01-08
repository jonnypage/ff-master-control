import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
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
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Edit } from 'lucide-react';
import {
  useTeamById,
  useMissionsForTeamEdit,
  useUpdateTeam,
  useAddCredits,
  useRemoveCredits,
  useOverrideMissionCompletion,
  useRemoveMissionCompletion,
} from '@/lib/api/useApi';

export function TeamEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { canEditTeams, canAdjustCredits } = usePermissions();
  const queryClient = useQueryClient();

  // Check if we're in edit mode based on URL path
  const isEditMode = location.pathname.endsWith('/edit');
  const canEdit = canEditTeams && isEditMode;

  const { data, isLoading } = useTeamById(id || '');

  const { data: missionsData } = useMissionsForTeamEdit();

  // Initialize state from data - component resets when id changes (via key in App.tsx)
  const teamData = data?.teamById;
  const [name, setName] = useState(() => teamData?.name ?? '');

  // Update state when data loads for the current team
  // Component resets when id changes, so we only need to sync when data becomes available
  if (teamData && name !== teamData.name) {
    setName(teamData.name);
  }

  const updateTeam = useUpdateTeam();
  const addCredits = useAddCredits();
  const removeCredits = useRemoveCredits();

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Team name is required');
      return;
    }

    const input: { name?: string } = {};
    if (name !== data?.teamById?.name) {
      input.name = name;
    }

    if (Object.keys(input).length === 0) {
      toast.info('No changes to save');
      return;
    }

    updateTeam.mutate(
      { id: id!, input },
      {
        onSuccess: () => {
          toast.success('Team updated successfully');
          queryClient.invalidateQueries({ queryKey: ['team', id] });
          queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message || 'Failed to update team';
          toast.error(message);
        },
      },
    );
  };

  const handleAddCredits = () => {
    if (!data?.teamById?._id) return;
    addCredits.mutate(
      { teamId: data.teamById._id, amount: 100 },
      {
        onSuccess: () => {
          toast.success('Credits added successfully');
          queryClient.invalidateQueries({ queryKey: ['team', id] });
          queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message || 'Failed to add credits';
          toast.error(message);
        },
      },
    );
  };

  const handleRemoveCredits = () => {
    if (!data?.teamById?._id) return;
    removeCredits.mutate(
      { teamId: data.teamById._id, amount: 100 },
      {
        onSuccess: () => {
          toast.success('Credits removed successfully');
          queryClient.invalidateQueries({ queryKey: ['team', id] });
          queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message || 'Failed to remove credits';
          toast.error(message);
        },
      },
    );
  };

  const overrideMissionCompletion = useOverrideMissionCompletion();
  const removeMissionCompletion = useRemoveMissionCompletion();

  const handleMissionToggle = (missionId: string, isCompleted: boolean) => {
    if (!isCompleted) {
      // Complete the mission
      overrideMissionCompletion.mutate(
        { teamId: id!, missionId },
        {
          onSuccess: () => {
            toast.success('Mission completion updated');
            queryClient.invalidateQueries({ queryKey: ['team', id] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
          },
          onError: (error: unknown) => {
            const message =
              (error as { response?: { errors?: Array<{ message?: string }> } })
                ?.response?.errors?.[0]?.message ||
              'Failed to update mission completion';
            toast.error(message);
          },
        },
      );
    } else {
      // Remove the mission completion
      removeMissionCompletion.mutate(
        { teamId: id!, missionId },
        {
          onSuccess: () => {
            toast.success('Mission completion removed');
            queryClient.invalidateQueries({ queryKey: ['team', id] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
          },
          onError: (error: unknown) => {
            const message =
              (error as { response?: { errors?: Array<{ message?: string }> } })
                ?.response?.errors?.[0]?.message ||
              'Failed to remove mission completion';
            toast.error(message);
          },
        },
      );
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
                  <Label>Team GUID</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
                    {team.teamGuid}
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
                  <Label>Team GUID</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
                    {team.teamGuid}
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
