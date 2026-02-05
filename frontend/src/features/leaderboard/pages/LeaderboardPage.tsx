import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { useLeaderboardMissions, useLeaderboardTeams } from '@/lib/api/useApi';
import { TeamBanner } from '@/features/teams/components/TeamBanner';
import { getBannerIconById } from '@/features/teams/components/banner-icons';
import type {
  GetLeaderboardTeamsQuery,
  GetMissionsForLeaderboardQuery,
} from '@/lib/graphql/generated';

type LeaderboardTeam = {
  _id: string;
  name: string;
  bannerColor: string;
  bannerIcon: string;
  completedMissionIds: string[];
};

type RankedTeam = LeaderboardTeam & {
  completedCount: number;
  totalMissions: number;
  hasCompletedFinal: boolean;
};

export function LeaderboardPage() {
  const {
    data: teamsData,
    isLoading: teamsLoading,
    error: teamsError,
  } = useLeaderboardTeams();

  const {
    data: missionsData,
    isLoading: missionsLoading,
    error: missionsError,
  } = useLeaderboardMissions();

  const isLoading = teamsLoading || missionsLoading;
  const hasError = teamsError || missionsError;

  const sortedTeams = useMemo((): RankedTeam[] => {
    const teams = (teamsData?.leaderboardTeams ??
      []) as GetLeaderboardTeamsQuery['leaderboardTeams'];
    const missions = (missionsData?.leaderboardMissions ??
      []) as GetMissionsForLeaderboardQuery['leaderboardMissions'];
    const totalMissions = missions.length;
    const finalChallengeIds = missions
      .filter((m) => m.isFinalChallenge)
      .map((m) => m._id);

    return teams
      .map(
        (team): RankedTeam => ({
          ...team,
          completedCount: team.completedMissionIds?.length ?? 0,
          totalMissions,
          hasCompletedFinal: finalChallengeIds.some((id) =>
            team.completedMissionIds?.includes(id),
          ),
        }),
      )
      .sort((a, b) => {
        if (b.completedCount !== a.completedCount) {
          return b.completedCount - a.completedCount;
        }
        return a.name.localeCompare(b.name);
      });
  }, [teamsData?.leaderboardTeams, missionsData?.leaderboardMissions]);

  const top3 = sortedTeams.slice(0, 3);
  const rest = sortedTeams.slice(3);

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <p className="text-xl text-muted-foreground">
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-destructive">Error loading leaderboard</p>
          <p className="text-muted-foreground mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page h-screen max-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      <div className="flex-1 flex flex-col container mx-auto px-6 py-4 min-h-0 w-full max-w-7xl">
        {/* Title - compact */}
        <div className="text-center shrink-0 py-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2 mb-4">
            Freedom Fighters - Leaderboard
          </h1>
        </div>

        {sortedTeams.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl text-muted-foreground">No teams yet</p>
          </div>
        ) : (
          <>
            {/* Top 3 - podium: 2nd | 1st (center, bigger) | 3rd */}
            <section className="shrink-0 mb-4">
              <div className="flex justify-center items-end gap-4">
                {/* 2nd place - left */}
                {top3[1] && (
                  <div
                    key={top3[1]._id}
                    className={`flex flex-col items-center rounded-xl border-2 bg-card shadow-md p-3 w-[180px] shrink-0 ${
                      top3[1].hasCompletedFinal
                        ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background border-primary'
                        : 'border-primary/50'
                    }`}
                  >
                    <span className="text-2xl font-bold text-gray-400">🥈</span>
                    <TeamBanner
                      color={top3[1].bannerColor}
                      icon={getBannerIconById(top3[1].bannerIcon)}
                      size="sm"
                      className="w-12 mt-1"
                    />
                    <h2 className="text-base font-bold text-foreground truncate w-full text-center mt-1.5">
                      {top3[1].name}
                    </h2>
                    <div className="text-lg font-bold text-primary">
                      {top3[1].completedCount}
                      {top3[1].totalMissions > 0 && (
                        <span className="text-xs font-normal text-muted-foreground">
                          /{top3[1].totalMissions}
                        </span>
                      )}
                    </div>
                    {top3[1].hasCompletedFinal && (
                      <span className="mt-0.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                        Final ✓
                      </span>
                    )}
                  </div>
                )}
                {/* 1st place - center, slightly bigger */}
                {top3[0] && (
                  <div
                    key={top3[0]._id}
                    className={`flex flex-col items-center rounded-xl border-2 bg-card shadow-lg p-4 w-[220px] shrink-0 ${
                      top3[0].hasCompletedFinal
                        ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background border-primary'
                        : 'border-primary'
                    }`}
                  >
                    <span className="text-3xl font-bold text-yellow-500">
                      🥇
                    </span>
                    <TeamBanner
                      color={top3[0].bannerColor}
                      icon={getBannerIconById(top3[0].bannerIcon)}
                      size="sm"
                      className="w-16 mt-1.5"
                    />
                    <h2 className="text-lg font-bold text-foreground truncate w-full text-center mt-2">
                      {top3[0].name}
                    </h2>
                    <div className="text-xl font-bold text-primary mt-1">
                      {top3[0].completedCount}
                      {top3[0].totalMissions > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /{top3[0].totalMissions}
                        </span>
                      )}
                    </div>
                    {top3[0].hasCompletedFinal && (
                      <span className="mt-0.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                        Final ✓
                      </span>
                    )}
                  </div>
                )}
                {/* 3rd place - right */}
                {top3[2] && (
                  <div
                    key={top3[2]._id}
                    className={`flex flex-col items-center rounded-xl border-2 bg-card shadow-md p-3 w-[180px] shrink-0 ${
                      top3[2].hasCompletedFinal
                        ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background border-primary'
                        : 'border-primary/50'
                    }`}
                  >
                    <span className="text-2xl font-bold text-amber-600">
                      🥉
                    </span>
                    <TeamBanner
                      color={top3[2].bannerColor}
                      icon={getBannerIconById(top3[2].bannerIcon)}
                      size="sm"
                      className="w-12 mt-1"
                    />
                    <h2 className="text-base font-bold text-foreground truncate w-full text-center mt-1.5">
                      {top3[2].name}
                    </h2>
                    <div className="text-lg font-bold text-primary">
                      {top3[2].completedCount}
                      {top3[2].totalMissions > 0 && (
                        <span className="text-xs font-normal text-muted-foreground">
                          /{top3[2].totalMissions}
                        </span>
                      )}
                    </div>
                    {top3[2].hasCompletedFinal && (
                      <span className="mt-0.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                        Final ✓
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* All other teams - scrollable list */}
            <section className="flex-1 min-h-0 flex flex-col">
              {rest.length > 0 && (
                <h2 className="text-lg font-semibold text-muted-foreground shrink-0 mb-2 px-1">
                  All teams
                </h2>
              )}
              <ul className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-2">
                {rest.map((team, index) => {
                  const actualIndex = 3 + index;
                  const rankColor = getRankColor(actualIndex);
                  return (
                    <li
                      key={team._id}
                      className={`flex items-center gap-4 bg-card border rounded-lg px-4 py-2.5 shadow-sm ${
                        team.hasCompletedFinal
                          ? 'border-yellow-500/50 ring-1 ring-yellow-400/30'
                          : 'border-border'
                      }`}
                    >
                      <span
                        className={`w-8 text-lg font-bold shrink-0 ${rankColor}`}
                      >
                        #{actualIndex + 1}
                      </span>
                      <TeamBanner
                        color={team.bannerColor}
                        icon={getBannerIconById(team.bannerIcon)}
                        size="sm"
                        className="w-10 shrink-0"
                      />
                      <span className="flex-1 text-lg font-semibold text-foreground truncate">
                        {team.name}
                      </span>
                      <span className="text-lg font-bold text-primary shrink-0">
                        {team.completedCount}
                        {team.totalMissions > 0 && (
                          <span className="text-sm font-normal text-muted-foreground">
                            /{team.totalMissions}
                          </span>
                        )}
                      </span>
                      {team.hasCompletedFinal && (
                        <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 shrink-0">
                          Final ✓
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
