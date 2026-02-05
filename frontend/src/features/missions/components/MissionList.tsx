import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Coins, Gem, Search, Target } from 'lucide-react';
import { useMissions, useMyTeam, useTeamsForMissions } from '@/lib/api/useApi';
import type { GetMissionsQuery } from '@/lib/graphql/generated';
import { useAuth } from '@/features/auth/lib/auth-context';

export function MissionList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { user, team } = useAuth();
  const isTeamSession = !!team && !user;

  const { data, isLoading } = useMissions();
  const { data: teamsData } = useTeamsForMissions({ enabled: !isTeamSession });
  const { data: myTeamData } = useMyTeam({ enabled: isTeamSession });

  const completionCounts = useMemo(() => {
    if (isTeamSession) {
      return { counts: {}, totalTeams: 0 };
    }
    const counts: Record<string, number> = {};
    const teams =
      (teamsData as { teams?: Array<{ completedMissionIds?: string[] }> })
        ?.teams ?? [];
    const totalTeams = teams.length;

    if (totalTeams === 0) {
      return { counts: {}, totalTeams: 0 };
    }

    (data?.missions ?? []).forEach(
      (mission: GetMissionsQuery['missions'][number]) => {
        const completedCount = teams.filter(
          (team: { completedMissionIds?: string[] }) =>
            team.completedMissionIds?.includes(mission._id) ?? false,
        ).length;
        counts[mission._id] = completedCount;
      },
    );

    return { counts, totalTeams };
  }, [data?.missions, teamsData, isTeamSession]);

  const myCompletedMissionIds = useMemo(() => {
    if (!isTeamSession) return [];
    return (myTeamData?.myTeam?.completedMissionIds ?? []) as string[];
  }, [isTeamSession, myTeamData?.myTeam?.completedMissionIds]);

  const filteredMissions = useMemo(() => {
    const missions = (data?.missions ?? []) as GetMissionsQuery['missions'];
    const search = searchTerm.trim().toLowerCase();
    const filtered = !search
      ? missions
      : missions.filter(
          (mission: GetMissionsQuery['missions'][number]) =>
            mission.name.toLowerCase().includes(search) ||
            mission.description?.toLowerCase().includes(search),
        );

    return [...filtered].sort((a, b) => {
      // Final challenge is always last, regardless of name.
      if (a.isFinalChallenge && !b.isFinalChallenge) return 1;
      if (!a.isFinalChallenge && b.isFinalChallenge) return -1;

      const nameCmp = a.name.localeCompare(b.name, undefined, {
        sensitivity: 'base',
      });
      if (nameCmp !== 0) return nameCmp;

      // Stable tie-breaker
      return a._id.localeCompare(b._id);
    });
  }, [data?.missions, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading missions...</p>
        </div>
      </div>
    );
  }

  if (!data?.missions || data.missions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">No missions found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a mission to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search missions by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMissions.map((mission: GetMissionsQuery['missions'][number]) =>
          (() => {
            const isCompletedByTeam = isTeamSession
              ? myCompletedMissionIds.includes(mission._id)
              : false;
            return (
              <Card
                key={mission._id}
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 group ${
                  isTeamSession
                    ? isCompletedByTeam
                      ? 'border-emerald-500/60 ring-2 ring-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10'
                      : 'border-border'
                    : ''
                }`}
                onClick={() => navigate(`/missions/${mission._id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {mission.name}
                    </CardTitle>
                    {mission.isFinalChallenge && (
                      <Badge variant="default">Final</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mission.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {mission.description}
                    </p>
                  )}
                  {!isTeamSession && (
                    <>
                      {mission.creditsAwarded > 0 ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground flex justify-between">
                            <Coins className="w-4 h-4 mr-2" />
                            Credits awarded:
                          </span>

                          <Badge
                            variant="secondary"
                            className="text-base font-semibold px-3 py-1"
                          >
                            {mission.creditsAwarded}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between h-6"></div>
                      )}
                      {mission.awardsCrystal ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground flex items-center">
                            <Gem className="w-4 h-4 mr-2" />
                            Awards a Crystal
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between h-6"></div>
                      )}
                    </>
                  )}
                  {isTeamSession ? (
                    <div className="flex items-center justify-between pt-6 border-t">
                      <span className="text-sm font-medium text-muted-foreground ">
                        Status
                      </span>
                      {isCompletedByTeam ? (
                        <Badge variant="default">Completed</Badge>
                      ) : (
                        <Badge variant="outline">Not completed</Badge>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm font-medium text-muted-foreground">
                        Completed
                      </span>
                      <Badge
                        variant="outline"
                        className="text-base font-semibold px-3 py-1"
                      >
                        {completionCounts.counts?.[mission._id] ?? 0}/
                        {completionCounts.totalTeams ?? 0}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })(),
        )}
      </div>

      {filteredMissions.length === 0 && searchTerm && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">No missions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              No missions matching "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
