import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Radio, Users, Check, X } from 'lucide-react';
import { useNFCReader } from '@/hooks/useNFCReader';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/lib/auth-context';
import type { GetTeamsForStoreQuery } from '@/lib/graphql/generated';
import {
  useTeamsForMissionCompletion,
  useCompleteMission,
  useRemoveMissionCompletion,
} from '@/lib/api/useApi';

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
  const [uncompletingTeamId, setUncompletingTeamId] = useState<string | null>(
    null,
  );
  const { isSupported, isReading, readNFC, checkSupport } = useNFCReader();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading } = useTeamsForMissionCompletion();

  const completeMission = useCompleteMission();
  const removeMissionCompletion = useRemoveMissionCompletion();

  interface Team {
    _id: string;
    name: string;
    nfcCardId: string;
    credits: number;
    completedMissionIds: string[];
  }

  const filteredTeams = useMemo(() => {
    const allTeams = ((data as { teams?: Team[] })?.teams ?? []) as Team[];
    if (!searchTerm.trim()) return allTeams;

    const searchLower = searchTerm.toLowerCase();
    return allTeams.filter(
      (team: Team) =>
        (team?.name || '').toLowerCase().includes(searchLower) ||
        (team?.nfcCardId || '').toLowerCase().includes(searchLower),
    );
  }, [data, searchTerm]);

  const handleNFCRead = async () => {
    if (!isSupported) {
      checkSupport();
      if (!isSupported) {
        toast.error('NFC is not supported on this device');
        return;
      }
    }

    const result = await readNFC();
    if (result.success && result.nfcId) {
      const foundTeam = ((data as { teams?: Team[] })?.teams ?? []).find(
        (team: Team) =>
          (team?.nfcCardId || '').toLowerCase() === result.nfcId?.toLowerCase(),
      );
      if (foundTeam) {
        toast.success('Team found!');
        setSearchTerm(result.nfcId);
        const isCompleted = (foundTeam?.completedMissionIds || []).includes(
          missionId,
        );
        if (!isCompleted) {
          // Complete the mission directly if not completed
          setCompletingTeamId(foundTeam?._id);
          completeMission.mutate(
            { missionId, nfcCardId: foundTeam?.nfcCardId },
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
        } else {
          toast.info('This team has already completed this mission');
        }
      } else {
        toast.error('Team not found');
        setSearchTerm(result.nfcId);
      }
    } else {
      toast.error(result.error || 'Failed to read NFC card');
    }
  };

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
            placeholder="Search teams by name or NFC card ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        {isSupported && (
          <Button
            onClick={handleNFCRead}
            disabled={isReading}
            variant="outline"
            className="h-11"
          >
            <Radio className="w-4 h-4 mr-2" />
            {isReading ? 'Reading...' : 'Scan NFC'}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredTeams.map((team: Team) => {
              const isCompleted = (team?.completedMissionIds || []).includes(
                missionId,
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
                  { missionId, nfcCardId: team?.nfcCardId },
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

              return (
                <div
                  key={team?._id}
                  className={`relative flex items-center justify-between px-4 h-[50px] transition-colors ${
                    isCompleted && !isAdmin
                      ? ''
                      : `hover:bg-accent/50 cursor-pointer ${isSelected ? 'bg-accent' : ''}`
                  }`}
                  onClick={handleRowClick}
                >
                  <span className="text-foreground font-medium">
                    {team?.name || 'Unnamed Team'}
                  </span>
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
                        <Badge variant="default">Completed</Badge>
                      )
                    ) : isSelected ? (
                      <Button
                        size="sm"
                        onClick={handleCompleteClick}
                        disabled={
                          completingTeamId === team?._id ||
                          completeMission.isPending
                        }
                        className="ml-auto"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {completingTeamId === team?._id ||
                        completeMission.isPending
                          ? 'Completing...'
                          : 'Complete Mission'}
                      </Button>
                    ) : (
                      <Badge variant="outline">Incomplete</Badge>
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
