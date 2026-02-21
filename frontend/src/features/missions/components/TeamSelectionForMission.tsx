import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Check, X, Clock, Play, Gem } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/lib/auth-context';
import type { GetTeamsForStoreQuery } from '@/lib/graphql/generated';
import { TeamBanner } from '@/features/teams/components/TeamBanner';
import { getBannerIconById } from '@/features/teams/components/banner-icons';
import {
  useTeamsForMissionCompletion,
  useCompleteMission,
  useRemoveMissionCompletion,
  useStartMission,
  useFailMission,
  useAdjustMissionTime,
  useMission,
  useMissions,
} from '@/lib/api/useApi';
import { MissionTimer } from './MissionTimer';
import { MissionManagementFlyout } from './MissionManagementFlyout';

interface TeamSelectionForMissionProps {
  missionId: string;
  onTeamSelect: (team: GetTeamsForStoreQuery['teams'][number]) => void;
}

interface Team {
  _id: string;
  name: string;
  bannerColor: string;
  bannerIcon: string;
  credits: number;
  crystals?: number;
  missions: { missionId: string; status: string; startedAt?: string; tries: number }[];
}

export function TeamSelectionForMission({
  missionId,
  onTeamSelect: _onTeamSelect,
}: TeamSelectionForMissionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [flyoutTeamId, setFlyoutTeamId] = useState<string | null>(null);
  const [completingTeamId, setCompletingTeamId] = useState<string | null>(null);
  const [startingTeamId, setStartingTeamId] = useState<string | null>(null);
  const [uncompletingTeamId, setUncompletingTeamId] = useState<string | null>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading } = useTeamsForMissionCompletion();
  const { data: missionData } = useMission(missionId);
  const { data: missionsData } = useMissions();

  const completeMission = useCompleteMission();
  const startMission = useStartMission();
  const failMission = useFailMission();
  const adjustMissionTime = useAdjustMissionTime();
  const removeMissionCompletion = useRemoveMissionCompletion();

  const mission8Id = useMemo(() => {
    const missions = (missionsData?.missions ?? []) as Array<{ _id: string; missionNumber: number }>;
    return missions.find((m) => m.missionNumber === 8)?._id ?? null;
  }, [missionsData?.missions]);

  const allTeams = useMemo(
    () => ((data as { teams?: Team[] })?.teams ?? []) as Team[],
    [data],
  );

  const filteredTeams = useMemo(() => {
    if (!searchTerm.trim()) return allTeams;
    const searchLower = searchTerm.toLowerCase();
    return allTeams.filter((t) => (t?.name || '').toLowerCase().includes(searchLower));
  }, [allTeams, searchTerm]);

  // Always resolve flyout team from full list so the timer stays live
  const flyoutTeam = flyoutTeamId ? allTeams.find((t) => t._id === flyoutTeamId) ?? null : null;
  const flyoutMissionEntry = flyoutTeam?.missions.find((m) => m.missionId === missionId);

  const invalidateAfterAction = () => {
    queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
    queryClient.invalidateQueries({ queryKey: ['missions'] });
    queryClient.invalidateQueries({ queryKey: ['teams-for-mission-completion'] });
  };

  const handleComplete = (teamId: string) => {
    setCompletingTeamId(teamId);
    completeMission.mutate(
      { missionId, teamId },
      {
        onSuccess: () => {
          toast.success('Mission marked as complete');
          setCompletingTeamId(null);
          setFlyoutTeamId(null);
          setSelectedTeamId(null);
          invalidateAfterAction();
        },
        onError: (error: unknown) => {
          setCompletingTeamId(null);
          const msg =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message || 'Failed to mark mission as complete';
          toast.error(msg);
        },
      },
    );
  };

  const handleFail = (teamId: string) => {
    failMission.mutate(
      { missionId, teamId },
      {
        onSuccess: () => {
          setFlyoutTeamId(null);
          setSelectedTeamId(null);
          invalidateAfterAction();
        },
      },
    );
  };

  const handleAddMinute = (teamId: string) => {
    adjustMissionTime.mutate({ missionId, teamId, minutes: 1 });
  };

  const handleUncomplete = (teamId: string) => {
    setUncompletingTeamId(teamId);
    removeMissionCompletion.mutate(
      { missionId, teamId },
      {
        onSuccess: () => {
          toast.success('Mission completion removed');
          setUncompletingTeamId(null);
          setSelectedTeamId(null);
          invalidateAfterAction();
        },
        onError: (error: unknown) => {
          setUncompletingTeamId(null);
          const msg =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message || 'Failed to remove mission completion';
          toast.error(msg);
        },
      },
    );
  };

  const handleStart = (team: Team) => {
    setStartingTeamId(team._id);
    startMission.mutate(
      { missionId, teamId: team._id },
      {
        onSuccess: () => {
          toast.success('Mission started');
          setStartingTeamId(null);
          setSelectedTeamId(null);
          setFlyoutTeamId(team._id);
          invalidateAfterAction();
        },
        onError: (error: unknown) => {
          setStartingTeamId(null);
          const msg =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message || 'Failed to start mission';
          toast.error(msg);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (!data?.teams || data.teams.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">No teams found</p>
          <p className="text-sm text-muted-foreground mt-1">
            No teams available to mark mission complete for
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasDuration = (missionData?.mission?.missionDuration ?? 0) > 0;

  return (
    <>
      <div className="space-y-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search teams by name or team ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredTeams.map((team) => {
                const missionEntry = team.missions.find((m) => m.missionId === missionId);
                const status = missionEntry?.status ?? 'NOT_ATTEMPTED';
                const isCompleted = status === 'COMPLETE';
                const isInProgress = status === 'IN_PROGRESS';
                const isSelected = selectedTeamId === team._id;
                const hasCompletedMission8 = mission8Id
                  ? team.missions.some((m) => m.missionId === mission8Id && m.status === 'COMPLETE')
                  : false;

                const handleRowClick = () => {
                  if (isInProgress) {
                    setFlyoutTeamId(team._id);
                    return;
                  }
                  if (isCompleted && isAdmin) {
                    setSelectedTeamId(isSelected ? null : team._id);
                    return;
                  }
                  if (!isCompleted) {
                    setSelectedTeamId(isSelected ? null : team._id);
                  }
                };

                return (
                  <div
                    key={team._id}
                    className={`relative flex items-center justify-between px-4 py-2 transition-colors ${
                      isCompleted
                        ? 'bg-green-600 dark:bg-green-700 text-white'
                        : isInProgress
                          ? 'bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer border-l-4 border-l-blue-500'
                          : isSelected
                            ? 'bg-accent hover:bg-accent/50 cursor-pointer border-l-4 border-l-primary'
                            : 'hover:bg-accent/50 cursor-pointer'
                    }`}
                    onClick={handleRowClick}
                  >
                    {/* Left: team identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <TeamBanner
                        color={team.bannerColor}
                        icon={getBannerIconById(team.bannerIcon)}
                        size="sm"
                        className="w-10 shrink-0"
                      />
                      <span className={`font-medium truncate ${isCompleted ? 'text-white' : 'text-foreground'}`}>
                        {team.name || 'Unnamed Team'}
                      </span>
                    </div>

                    {/* Right: status / actions */}
                    <div className="flex items-center shrink-0 ml-3">
                      {isCompleted ? (
                        isAdmin && isSelected ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => { e.stopPropagation(); handleUncomplete(team._id); }}
                            disabled={uncompletingTeamId === team._id || removeMissionCompletion.isPending}
                          >
                            <X className="w-4 h-4 mr-2" />
                            {uncompletingTeamId === team._id ? 'Removing...' : 'Mark as incomplete'}
                          </Button>
                        ) : (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="flex items-center gap-1.5 text-white">
                              <Check className="w-4 h-4" />
                              Completed
                            </span>
                            {isAdmin && missionData?.mission?.isFinalChallenge && mission8Id && (
                              <>
                                <span className="text-xs text-white/90">
                                  Mission 8:{' '}
                                  <span className={hasCompletedMission8 ? 'text-green-200 font-semibold' : 'text-red-200 font-semibold'}>
                                    {hasCompletedMission8 ? 'Yes' : 'No'}
                                  </span>
                                </span>
                                <span className="text-xs text-white/90 flex items-center gap-1">
                                  <Gem className="w-3 h-3" />
                                  Crystals: {hasCompletedMission8 ? (team.crystals ?? 0) : 0}
                                </span>
                              </>
                            )}
                          </div>
                        )
                      ) : isInProgress ? (
                        /* Show live timer + tap hint */
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          {missionEntry?.startedAt && missionData?.mission?.missionDuration ? (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded text-xs font-medium">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <MissionTimer
                                startedAt={missionEntry.startedAt}
                                duration={missionData.mission.missionDuration}
                                onExpire={() => handleFail(team._id)}
                              />
                            </div>
                          ) : (
                            <span className="text-sm text-blue-600 dark:text-blue-400">In Progress</span>
                          )}
                        </div>
                      ) : isSelected ? (
                        /* Not started / failed — show inline start or complete */
                        (() => {
                          const isNotStarted = status === 'NOT_ATTEMPTED' || status === 'NOT_STARTED' || status === 'FAILED';
                          if (!isNotStarted) return null;

                          if (!hasDuration) {
                            return (
                              <Button
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleComplete(team._id); }}
                                disabled={completingTeamId === team._id || completeMission.isPending}
                              >
                                {completingTeamId === team._id ? 'Completing...' : 'Mark as Complete'}
                              </Button>
                            );
                          }

                          return (
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleStart(team); }}
                              disabled={startingTeamId === team._id || startMission.isPending}
                            >
                              {startingTeamId === team._id ? 'Starting...' : (
                                <><Play className="w-4 h-4 mr-2" />Start Mission</>
                              )}
                            </Button>
                          );
                        })()
                      ) : (
                        /* Collapsed status label */
                        <span className="text-sm text-muted-foreground font-medium">
                          {(() => {
                            const tries = missionEntry?.tries ?? 0;
                            if (status === 'FAILED' && tries > 1) return `Failed ${tries}x`;
                            return status
                              .toLowerCase()
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (l) => l.toUpperCase());
                          })()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {filteredTeams.length === 0 && searchTerm && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">No teams found</p>
              <p className="text-sm text-muted-foreground mt-1">
                No teams matching "{searchTerm}"
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <MissionManagementFlyout
        open={!!flyoutTeamId}
        onOpenChange={(open) => { if (!open) setFlyoutTeamId(null); }}
        team={flyoutTeam}
        missionId={missionId}
        missionName={missionData?.mission?.name}
        missionDuration={missionData?.mission?.missionDuration ?? 0}
        missionEntry={flyoutMissionEntry}
        onComplete={handleComplete}
        onFail={handleFail}
        onAddMinute={handleAddMinute}
        completingTeamId={completingTeamId}
        isCompleting={completeMission.isPending}
        isFailing={failMission.isPending}
        isAddingMinute={adjustMissionTime.isPending}
      />
    </>
  );
}
