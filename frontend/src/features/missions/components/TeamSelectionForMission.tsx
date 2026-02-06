import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Check, X, Clock, Play, Square, Plus } from 'lucide-react';
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
} from '@/lib/api/useApi';

function MissionTimer({
  startedAt,
  duration,
}: {
  startedAt: string;
  duration: number;
}) {
  // duration is in minutes
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useMemo(() => {
    // Initial calc
    const start = new Date(startedAt).getTime();
    const now = new Date().getTime();
    const end = start + duration * 60 * 1000;
    setTimeLeft(Math.max(0, end - now));
  }, [startedAt, duration]);

  useState(() => {
    const interval = setInterval(() => {
      const start = new Date(startedAt).getTime();
      const now = new Date().getTime();
      const end = start + duration * 60 * 1000;
      const remaining = end - now;
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  });

  const minutes = Math.floor(Math.abs(timeLeft) / 60000);
  const seconds = Math.floor((Math.abs(timeLeft) % 60000) / 1000);
  const isOverdue = timeLeft < 0;

  return (
    <span
      className={`font-mono text-sm ${isOverdue ? 'text-destructive font-bold' : 'text-muted-foreground'}`}
    >
      {isOverdue && '-'}
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}

interface TeamSelectionForMissionProps {
  missionId: string;
  onTeamSelect: (team: GetTeamsForStoreQuery['teams'][number]) => void;
}

export function TeamSelectionForMission({
  missionId,
  onTeamSelect: _onTeamSelect,
}: TeamSelectionForMissionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [completingTeamId, setCompletingTeamId] = useState<string | null>(null);
  const [startingTeamId, setStartingTeamId] = useState<string | null>(null);
  const [uncompletingTeamId, setUncompletingTeamId] = useState<string | null>(
    null,
  );
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading } = useTeamsForMissionCompletion();

  const { data: missionData } = useMission(missionId);
  const completeMission = useCompleteMission();
  const startMission = useStartMission();
  const failMission = useFailMission();
  const adjustMissionTime = useAdjustMissionTime();
  const removeMissionCompletion = useRemoveMissionCompletion();

  interface Team {
    _id: string;
    name: string;
    bannerColor: string;
    bannerIcon: string;
    credits: number;
    missions: { missionId: string; status: string; startedAt?: string }[];
  }

  const filteredTeams = useMemo(() => {
    const allTeams = ((data as { teams?: Team[] })?.teams ?? []) as Team[];
    if (!searchTerm.trim()) return allTeams;

    const searchLower = searchTerm.toLowerCase();
    return allTeams.filter((team: Team) =>
      (team?.name || '').toLowerCase().includes(searchLower),
    );
  }, [data, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
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

  return (
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
            {filteredTeams.map((team: Team) => {
              const isCompleted = (team?.missions || []).some(
                (m) => m.missionId === missionId && m.status === 'COMPLETE',
              );
              const isSelected = selectedTeamId === team?._id;
              const handleRowClick = () => {
                if (isCompleted && isAdmin) {
                  // For admins, clicking completed team shows uncomplete option
                  setSelectedTeamId(isSelected ? null : team?._id);
                } else if (!isCompleted) {
                  setSelectedTeamId(isSelected ? null : team?._id);
                }
              };
              const handleCompleteClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                setCompletingTeamId(team?._id);
                completeMission.mutate(
                  { missionId, teamId: team?._id },
                  {
                    onSuccess: () => {
                      toast.success('Mission marked as complete');
                      setCompletingTeamId(null);
                      setSelectedTeamId(null);
                      queryClient.invalidateQueries({
                        queryKey: ['mission', missionId],
                      });
                      queryClient.invalidateQueries({ queryKey: ['missions'] });
                    },
                    onError: (error: unknown) => {
                      setCompletingTeamId(null);
                      const errorMessage =
                        (
                          error as {
                            response?: { errors?: Array<{ message?: string }> };
                          }
                        )?.response?.errors?.[0]?.message ||
                        'Failed to mark mission as complete';
                      toast.error(errorMessage);
                    },
                  },
                );
              };
              const handleUncompleteClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                setUncompletingTeamId(team?._id);
                removeMissionCompletion.mutate(
                  { missionId, teamId: team?._id },
                  {
                    onSuccess: () => {
                      toast.success('Mission completion removed');
                      setUncompletingTeamId(null);
                      queryClient.invalidateQueries({
                        queryKey: ['mission', missionId],
                      });
                      queryClient.invalidateQueries({ queryKey: ['missions'] });
                    },
                    onError: (error: unknown) => {
                      setUncompletingTeamId(null);
                      const errorMessage =
                        (
                          error as {
                            response?: { errors?: Array<{ message?: string }> };
                          }
                        )?.response?.errors?.[0]?.message ||
                        'Failed to remove mission completion';
                      toast.error(errorMessage);
                    },
                  },
                );
              };

              const handleStartClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                setStartingTeamId(team?._id);
                startMission.mutate(
                  { missionId, teamId: team?._id },
                  {
                    onSuccess: () => {
                      toast.success('Mission started');
                      setStartingTeamId(null);
                      setSelectedTeamId(null);
                      queryClient.invalidateQueries({
                        queryKey: ['mission', missionId],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ['teams-for-mission-completion'],
                      });
                    },
                    onError: (error: unknown) => {
                      setStartingTeamId(null);
                      const errorMessage =
                        (
                          error as {
                            response?: { errors?: Array<{ message?: string }> };
                          }
                        )?.response?.errors?.[0]?.message ||
                        'Failed to start mission';
                      toast.error(errorMessage);
                    },
                  },
                );
              };

              return (
                <div
                  key={team?._id}
                  className={`relative flex items-center justify-between px-4 py-2 transition-colors ${
                    isCompleted
                      ? 'bg-green-600 dark:bg-green-700 text-white'
                      : isSelected
                        ? 'bg-accent hover:bg-accent/50 cursor-pointer border-l-4 border-l-primary'
                        : (team?.missions || []).some(m => m.missionId === missionId && m.status === 'INCOMPLETE') 
                          ? 'bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer border-l-4 border-l-blue-500' // Running state
                          : 'hover:bg-accent/50 cursor-pointer'
                  }`}
                  onClick={handleRowClick}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <TeamBanner
                      color={team.bannerColor}
                      icon={getBannerIconById(team.bannerIcon)}
                      size="sm"
                      className="w-10 shrink-0"
                    />
                    <span
                      className={`font-medium truncate ${isCompleted ? 'text-white' : 'text-foreground'}`}
                    >
                      {team?.name || 'Unnamed Team'}
                    </span>
                  </div>
                  <div className="flex items-center h-full">
                    {isCompleted ? (
                      isAdmin && isSelected ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleUncompleteClick}
                          disabled={
                            uncompletingTeamId === team?._id ||
                            removeMissionCompletion.isPending
                          }
                          className="ml-auto"
                        >
                          <X className="w-4 h-4 mr-2" />
                          {uncompletingTeamId === team?._id ||
                          removeMissionCompletion.isPending
                            ? 'Removing...'
                            : 'Mark as incomplete'}
                        </Button>
                      ) : (
                        <span className="flex items-center gap-1.5 text-white shrink-0">
                          <Check className="w-4 h-4" />
                          Completed
                        </span>
                      )
                    ) : isSelected ? (
                      (() => {
                        const missionEntry = (team?.missions || []).find(
                          (m) => m.missionId === missionId,
                        );
                        const status = missionEntry?.status || 'NOT_STARTED';
                        const isRunning = status === 'INCOMPLETE'; // Assuming INCOMPLETE means In Progress
                        const isNotStarted = status === 'NOT_STARTED' || status === 'FAILED'; // Allow restart if failed? Or just Not Started.

                        if (isNotStarted) {
                          return (
                            <Button
                              size="sm"
                              onClick={handleStartClick}
                              disabled={
                                startingTeamId === team?._id ||
                                startMission.isPending
                              }
                              className="ml-auto"
                            >
                              {startingTeamId === team?._id ||
                              startMission.isPending ? (
                                'Starting...'
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Start Mission
                                </>
                              )}
                            </Button>
                          );
                        }

                        if (isRunning) {
                           const handleFailClick = (e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to fail this team?')) {
                              failMission.mutate({ missionId, teamId: team?._id });
                            }
                          };

                          const handleAddMinuteClick = (e: React.MouseEvent) => {
                            e.stopPropagation();
                            adjustMissionTime.mutate({
                              missionId,
                              teamId: team?._id,
                              minutes: 1,
                            });
                          };

                          return (
                            <div className="flex items-center gap-2 ml-auto">
                               {missionEntry?.startedAt && missionData?.mission?.missionDuration ? (
                                <div className="mr-2 px-2 py-1 bg-background/50 rounded border flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                  <MissionTimer
                                    startedAt={missionEntry.startedAt}
                                    duration={missionData.mission.missionDuration}
                                  />
                                </div>
                              ) : null}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleAddMinuteClick}
                                disabled={adjustMissionTime.isPending}
                                title="Add 1 Minute"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleFailClick}
                                disabled={failMission.isPending}
                              >
                                <Square className="w-4 h-4 mr-2" />
                                Stop (Fail)
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleCompleteClick}
                                disabled={
                                  completingTeamId === team?._id ||
                                  completeMission.isPending
                                }
                              >
                                <Check className="w-4 h-4 mr-2" />
                                {completingTeamId === team?._id ||
                                completeMission.isPending
                                  ? 'Completing...'
                                  : 'Complete'}
                              </Button>
                            </div>
                          );
                        }
                        
                         // Fallback for weird states
                        return (
                           <span className="text-sm text-muted-foreground">
                             Status: {status}
                           </span>
                        );

                      })()
                    ) : (
                      <div className="flex items-center gap-3">
                        {((team?.missions || []).find((m) => m.missionId === missionId)?.status === 'INCOMPLETE') && missionData?.mission?.missionDuration && (team?.missions || []).find((m) => m.missionId === missionId)?.startedAt && (
                           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/50 rounded text-xs">
                              <MissionTimer
                                  startedAt={(team?.missions || []).find((m) => m.missionId === missionId)!.startedAt!}
                                  duration={missionData.mission.missionDuration}
                              />
                           </div>
                        )}
                        <span className="flex items-center gap-1.5 text-muted-foreground shrink-0 text-sm font-medium">
                          {((team?.missions || []).find((m) => m.missionId === missionId)?.status || 'NOT_STARTED')
                            .toLowerCase()
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                       </span>
                      </div>
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
  );
}
