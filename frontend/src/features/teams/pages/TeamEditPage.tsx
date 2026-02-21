import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Save,
  Plus,
  Minus,
  CheckCircle2,
  Users,
  Coins,
  Gem,
  ScrollText,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Edit } from 'lucide-react';
import { TeamBanner } from '../components/TeamBanner';
import {
  BANNER_ICON_OPTIONS,
  type BannerIconId,
} from '../components/banner-icons';
import {
  useTeamById,
  useMissionsForTeamEdit,
  useMissions,
  useUpdateTeam,
  useAddCredits,
  useRemoveCredits,
  useOverrideMissionCompletion,
  useRemoveMissionCompletion,
  useDeleteTeam,
} from '@/lib/api/useApi';

export function TeamEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { canEditTeams, canAdjustCredits, userRole } = usePermissions();
  const isAdmin = userRole === 'ADMIN';
  const queryClient = useQueryClient();

  // Check if we're in edit mode based on URL path
  const isEditMode = location.pathname.endsWith('/edit');
  const canEdit = canEditTeams && isEditMode;

  const { data, isLoading } = useTeamById(id || '');

  const { data: missionsData } = useMissionsForTeamEdit();
  const { data: allMissionsData } = useMissions();
  const mission8Id = useMemo(() => {
    const missions = (allMissionsData?.missions ?? []) as Array<{ _id: string; missionNumber: number }>;
    return missions.find((m) => m.missionNumber === 8)?._id ?? null;
  }, [allMissionsData?.missions]);

  // Initialize state from data - component resets when id changes (via key in App.tsx)
  const teamData = data?.teamById;
  const [name, setName] = useState(() => teamData?.name ?? '');
  const [bannerColor, setBannerColor] = useState(
    () => teamData?.bannerColor ?? '#020817',
  );
  const [bannerIcon, setBannerIcon] = useState<BannerIconId>(
    () => (teamData?.bannerIcon as BannerIconId) ?? 'Shield',
  );

  // Sync state from server only when we switch teams (prevents overwriting edits on every render).
  const lastLoadedTeamIdRef = useRef<string | null>(null);
  useEffect(() => {
    const currentId = teamData?._id ?? null;
    if (!currentId) return;
    if (lastLoadedTeamIdRef.current === currentId) return;
    lastLoadedTeamIdRef.current = currentId;

    const nextName = teamData?.name ?? '';
    const nextColor = teamData?.bannerColor ?? '#020817';
    const nextIcon = (teamData?.bannerIcon as BannerIconId) ?? 'Shield';
    queueMicrotask(() => {
      setName(nextName);
      setBannerColor(nextColor);
      setBannerIcon(nextIcon);
    });
  }, [teamData]);

  const updateTeam = useUpdateTeam();
  const addCredits = useAddCredits();
  const removeCredits = useRemoveCredits();
  const deleteTeam = useDeleteTeam();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Team name is required');
      return;
    }

    const input: { name?: string; bannerColor?: string; bannerIcon?: string } =
      {};
    if (name !== data?.teamById?.name) {
      input.name = name;
    }
    if (bannerColor !== data?.teamById?.bannerColor) {
      input.bannerColor = bannerColor;
    }
    if (bannerIcon !== data?.teamById?.bannerIcon) {
      input.bannerIcon = bannerIcon;
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
          queryClient.invalidateQueries({ queryKey: ['team-by-id', id] });
          // Back-compat: older code used this key
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
          queryClient.invalidateQueries({ queryKey: ['team-by-id', id] });
          // Back-compat: older code used this key
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
            console.log('[Mission Toggle] Marking complete:', {
              teamId: id,
              missionId,
            });
            toast.success('Mission completion updated');
            // Optimistically update the cache
            queryClient.setQueryData(['team-by-id', id], (old: any) => {
              console.log('[Mission Toggle] Old cache data:', old);
              if (!old?.teamById) {
                console.warn('[Mission Toggle] No teamById in cache');
                return old;
              }
              const updated = {
                ...old,
                teamById: {
                  ...old.teamById,
                  missions: [
                    ...(old.teamById.missions || []),
                    {
                      missionId,
                      status: 'COMPLETE',
                      completedAt: new Date().toISOString(),
                    },
                  ],
                },
              };
              console.log('[Mission Toggle] Updated cache data:', updated);
              return updated;
            });
            // Also invalidate to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['team-by-id', id] });
            queryClient.invalidateQueries({ queryKey: ['team', id] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard-teams'] });
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
            console.log('[Mission Toggle] Removing completion:', {
              teamId: id,
              missionId,
            });
            toast.success('Mission completion removed');
            // Optimistically update the cache
            queryClient.setQueryData(['team-by-id', id], (old: any) => {
              console.log('[Mission Toggle] Old cache data:', old);
              if (!old?.teamById) {
                console.warn('[Mission Toggle] No teamById in cache');
                return old;
              }
              const updated = {
                ...old,
                teamById: {
                  ...old.teamById,
                  missions: (old.teamById.missions || []).filter(
                    (m: any) => m.missionId !== missionId,
                  ),
                },
              };
              console.log('[Mission Toggle] Updated cache data:', updated);
              return updated;
            });
            // Also invalidate to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['team-by-id', id] });
            queryClient.invalidateQueries({ queryKey: ['team', id] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard-teams'] });
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            className="shadow-md sm:shrink-0"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {isAdmin && (
        <details className="rounded-lg border border-border bg-card">
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-foreground">
            Team Admin
          </summary>
          <div className="px-4 pb-4">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-destructive flex items-center">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Permanently delete this team and all associated data. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteTeam.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteTeam.isPending ? 'Deleting...' : 'Delete Team'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </details>
      )}

      <div className="w-full space-y-6">
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
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <Label>Banner Preview</Label>
                    <div className="mt-2">
                      <TeamBanner
                        color={bannerColor}
                        icon={
                          BANNER_ICON_OPTIONS.find((o) => o.id === bannerIcon)
                            ?.Icon
                        }
                        size="sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="banner-color">Banner Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="banner-color"
                          type="color"
                          value={bannerColor}
                          onChange={(e) => setBannerColor(e.target.value)}
                          className="h-11 w-16 p-1"
                        />
                        <Input
                          value={bannerColor}
                          onChange={(e) => setBannerColor(e.target.value)}
                          placeholder="#7c3aed"
                          className="font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Banner Icon</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {BANNER_ICON_OPTIONS.map(({ id, label, Icon }) => {
                          const isSelected = bannerIcon === id;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setBannerIcon(id)}
                              className={`h-10 rounded-md border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-primary ring-2 ring-primary/30 bg-accent'
                                  : 'border-border hover:bg-accent/50'
                              }`}
                              aria-pressed={isSelected}
                              aria-label={label}
                              title={label}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Team Code</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
                    {team.teamCode}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div>
                      <Label>Team Name</Label>
                      <div className="px-3 py-2 bg-muted rounded-md text-sm">
                        {team.name}
                      </div>
                    </div>
                    <div>
                      <Label>Team Code</Label>
                      <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
                        {team.teamCode}
                      </div>
                    </div>
                  </div>
                  <TeamBanner
                    color={team.bannerColor}
                    icon={
                      BANNER_ICON_OPTIONS.find(
                        (o) => o.id === (team.bannerIcon as BannerIconId),
                      )?.Icon
                    }
                    size="sm"
                  />
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
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Coins className="w-4 h-4 shrink-0" />
                Credits:
              </span>
              <Badge variant="secondary" className="text-lg font-semibold">
                {typeof team.credits === 'number' ? team.credits : 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Gem className="w-4 h-4 shrink-0" />
                Crystals:
              </span>
              <Badge variant="secondary" className="text-lg font-semibold">
                {typeof team.crystals === 'number' ? team.crystals : 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <ScrollText className="w-4 h-4 shrink-0" />
                Missions Completed:
              </span>
              <Badge>
                {
                  (team.missions ?? []).filter(
                    (m: any) => m.status === 'COMPLETE',
                  ).length
                }
                /{missionsData?.missions?.length ?? 0}
              </Badge>
            </div>
            {isAdmin && mission8Id && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Mission 8 completed:
                  </span>
                  <Badge
                    variant="secondary"
                    className={(team.missions ?? []).some((m: any) => m.missionId === mission8Id && m.status === 'COMPLETE')
                      ? 'bg-green-600 text-white hover:bg-green-600'
                      : 'bg-red-600 text-white hover:bg-red-600'}
                  >
                    {(team.missions ?? []).some((m: any) => m.missionId === mission8Id && m.status === 'COMPLETE')
                      ? 'Yes'
                      : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Gem className="w-4 h-4 shrink-0" />
                    Crystals for end boss:
                  </span>
                  <Badge variant="secondary" className="text-lg font-semibold">
                    {(team.missions ?? []).some((m: any) => m.missionId === mission8Id && m.status === 'COMPLETE')
                      ? (typeof team.crystals === 'number' ? team.crystals : 0)
                      : 0}
                  </Badge>
                </div>
              </>
            )}
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
                {[...missionsData.missions]
                  .sort((a: any, b: any) => {
                    if (a.isFinalChallenge && !b.isFinalChallenge) return 1;
                    if (!a.isFinalChallenge && b.isFinalChallenge) return -1;
                    return (a.name ?? '').localeCompare(b.name ?? '');
                  })
                  .map((mission: any) => {
                    const isCompleted = team.missions?.some(
                      (m: any) =>
                        m.missionId === mission._id && m.status === 'COMPLETE',
                    );
                    const isPending =
                      overrideMissionCompletion.isPending ||
                      removeMissionCompletion.isPending;
                    return (
                      <button
                        key={mission._id}
                        type="button"
                        onClick={() =>
                          handleMissionToggle(mission._id, isCompleted)
                        }
                        disabled={isPending}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-accent hover:bg-muted/50 ${
                          isCompleted
                            ? 'bg-green-600 dark:bg-green-700 border-green-600 text-white'
                            : ''
                        }`}
                      >
                        <span className="font-medium truncate">
                          {mission.name}
                          {mission.isFinalChallenge && (
                            <Badge variant="default" className="text-xs ml-2">
                              Final
                            </Badge>
                          )}
                        </span>
                        {isCompleted && (
                          <span className="flex items-center gap-1.5 text-white shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                          </span>
                        )}
                      </button>
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

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{team?.name}"? This will permanently remove the team
              and all associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!id) return;
                deleteTeam.mutate(
                  { id },
                  {
                    onSuccess: (data) => {
                      if (data?.deleteTeam) {
                        toast.success('Team deleted');
                        setShowDeleteConfirm(false);
                        queryClient.invalidateQueries({ queryKey: ['teams'] });
                        queryClient.invalidateQueries({ queryKey: ['teams-for-store'] });
                        queryClient.invalidateQueries({ queryKey: ['leaderboard-teams'] });
                        navigate('/teams');
                      } else {
                        toast.error('Team not found or already deleted');
                      }
                    },
                    onError: (error: unknown) => {
                      const msg =
                        (error as { response?: { errors?: Array<{ message?: string }> } })
                          ?.response?.errors?.[0]?.message || 'Failed to delete team';
                      toast.error(msg);
                    },
                  },
                );
              }}
              disabled={deleteTeam.isPending}
            >
              {deleteTeam.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
