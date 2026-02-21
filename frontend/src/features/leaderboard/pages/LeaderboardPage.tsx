import { useCallback, useEffect, useMemo } from 'react';
import { useLeaderboardMissions, useLeaderboardTeams } from '@/lib/api/useApi';
import { TeamBanner } from '@/features/teams/components/TeamBanner';
import { getBannerIconById } from '@/features/teams/components/banner-icons';
import { LeaderboardJoinScreen } from '@/features/leaderboard/components/LeaderboardJoinScreen';
import { ScrollText } from 'lucide-react';
import type { GetMissionsForLeaderboardQuery } from '@/lib/graphql/generated';

type LeaderboardTeam = {
  _id: string;
  name: string;
  bannerColor: string;
  bannerIcon: string;
  missions: {
    missionId: string;
    status: string;
    completedAt: string;
  }[];
};

type RankedTeam = LeaderboardTeam & {
  completedCount: number;
  totalMissions: number;
  hasCompletedFinal: boolean;
  completionTime?: number; // timestamp for sorting
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

  // Fullscreen toggle on F key
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  // Prevent screen sleep only when in fullscreen mode
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      if (!document.fullscreenElement) return;
      try {
        wakeLock = await navigator.wakeLock.request('screen');
      } catch {
        // Wake lock may fail (e.g. low battery, not visible)
      }
    };

    const releaseWakeLock = () => {
      wakeLock?.release().catch(() => {});
      wakeLock = null;
    };

    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        requestWakeLock();
      } else {
        releaseWakeLock();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && document.fullscreenElement) {
        requestWakeLock();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, []);
  const hasError = teamsError || missionsError;

  const sortedTeams = useMemo((): RankedTeam[] => {
    const teams = (teamsData?.leaderboardTeams ??
      []) as unknown as LeaderboardTeam[];
    const missions = (missionsData?.leaderboardMissions ??
      []) as GetMissionsForLeaderboardQuery['leaderboardMissions'];
    const totalMissions = missions.length;
    const finalChallengeIds = missions
      .filter((m) => m.isFinalChallenge)
      .map((m) => m._id);

    return teams
      .map((team): RankedTeam => {
        // Only count missions with COMPLETE status
        const completedMissions =
          team.missions?.filter((m) => m.status === 'COMPLETE') ?? [];
        const completedCount = completedMissions.length;
        const hasCompletedFinal = finalChallengeIds.some((id) =>
          completedMissions.some((cm) => cm.missionId === id),
        );

        let completionTime: number | undefined;
        if (completedCount > 0) {
          // Find the latest completedAt timestamp
          const timestamps = completedMissions.map((cm) =>
            new Date(cm.completedAt).getTime(),
          );
          completionTime = Math.max(...timestamps);
        }

        return {
          ...team,
          completedCount,
          totalMissions,
          hasCompletedFinal,
          completionTime,
        };
      })
      .sort((a, b) => {
        // 1. Teams that have completed final mission first
        if (a.hasCompletedFinal && !b.hasCompletedFinal) return -1;
        if (!a.hasCompletedFinal && b.hasCompletedFinal) return 1;

        // If both completed final, sort by completion time (earlier is better)
        if (a.hasCompletedFinal && b.hasCompletedFinal) {
          if (a.completionTime !== b.completionTime) {
            return (a.completionTime || 0) - (b.completionTime || 0);
          }
        }

        // 2. Sort by completed count (desc)
        if (b.completedCount !== a.completedCount) {
          return b.completedCount - a.completedCount;
        }

        // 3. If counts equal, sort by completion time (earlier is better)
        // Note: completionTime is only undefined if completedCount is 0,
        // in which case they are equal anyway.
        if (a.completionTime !== b.completionTime) {
          return (a.completionTime || 0) - (b.completionTime || 0);
        }

        // 4. Name (asc)
        return a.name.localeCompare(b.name);
      });
  }, [teamsData?.leaderboardTeams, missionsData?.leaderboardMissions]);

  const hasAnyCompletedMissions = sortedTeams.some((t) => t.completedCount > 0);
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
      <div className="flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-destructive">Error loading leaderboard</p>
          <p className="text-muted-foreground mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }

  if (!hasAnyCompletedMissions) {
    const joinScreenTeams = sortedTeams.map((t) => ({
      _id: t._id,
      name: t.name,
      bannerColor: t.bannerColor,
      bannerIcon: t.bannerIcon,
    }));
    return <LeaderboardJoinScreen teams={joinScreenTeams} />;
  }

  const medalForRank = (index: number) =>
    index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

  const renderTeamRow = (team: RankedTeam, actualIndex: number) => {
    const rankColor = getRankColor(actualIndex);
    const medal = medalForRank(actualIndex);
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
          className={`w-8 text-lg font-bold shrink-0 flex items-center justify-center ${rankColor}`}
        >
          {medal ?? `#${actualIndex + 1}`}
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
        <span className="text-lg font-bold text-primary shrink-0 flex items-center gap-1">
          <ScrollText className="w-4 h-4 text-muted-foreground shrink-0" />
          {team.completedCount}
          {team.totalMissions > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              /{team.totalMissions}
            </span>
          )}
        </span>
       
      </li>
    );
  };

  return (
    <div className="leaderboard-page flex flex-col bg-gradient-to-br from-background via-background to-muted/20 overflow-y-auto md:overflow-hidden">
      <div className="flex flex-col md:flex-1 container mx-auto px-6 py-4 md:min-h-0 w-full max-w-7xl">
        {/* Title - mobile: two lines; desktop: one line with dash */}
        <div className="text-center shrink-0 py-2">
          <h1 className="text-4xl font-bold text-foreground flex flex-col md:flex-row md:items-center md:justify-center gap-0 md:gap-2 mb-4">
            <span>Leaderboard</span>
          </h1>
        </div>

        {sortedTeams.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-xl text-muted-foreground">
              It is quiet here...{' '}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop only: Top 3 podium row (2nd | 1st | 3rd) */}
            <section className="hidden md:block shrink-0 mb-4">
              <div className="flex justify-center items-end gap-4">
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
                    <div className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                      <ScrollText className="w-4 h-4 text-muted-foreground shrink-0" />
                      {top3[1].completedCount}
                      {top3[1].totalMissions > 0 && (
                        <span className="text-xs font-normal text-muted-foreground">
                          /{top3[1].totalMissions}
                        </span>
                      )}
                    </div>
                    
                  </div>
                )}
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
                    <div className="text-xl font-bold text-primary mt-1 flex items-center justify-center gap-1">
                      <ScrollText className="w-5 h-5 text-muted-foreground shrink-0" />
                      {top3[0].completedCount}
                      {top3[0].totalMissions > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /{top3[0].totalMissions}
                        </span>
                      )}
                    </div>
                    
                  </div>
                )}
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
                    <div className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                      <ScrollText className="w-4 h-4 text-muted-foreground shrink-0" />
                      {top3[2].completedCount}
                      {top3[2].totalMissions > 0 && (
                        <span className="text-xs font-normal text-muted-foreground">
                          /{top3[2].totalMissions}
                        </span>
                      )}
                    </div>
                   
                  </div>
                )}
              </div>
            </section>

            {/* Mobile: top 3 with medals, then "All teams" heading, then the rest */}
            <section className="md:hidden space-y-1.5 pb-6">
              <ul className="space-y-1.5">
                {top3.map((team, index) => renderTeamRow(team, index))}
              </ul>
              {rest.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-muted-foreground pt-2 pb-1 px-1">
                    All teams
                  </h2>
                  <ul className="space-y-1.5">
                    {rest.map((team, index) => renderTeamRow(team, 3 + index))}
                  </ul>
                </>
              )}
            </section>

            {/* Desktop: All other teams - scrollable list */}
            <section className="hidden md:flex flex-1 min-h-0 flex-col">
              {rest.length > 0 && (
                <h2 className="text-lg font-semibold text-muted-foreground shrink-0 mb-2 px-1">
                  All teams
                </h2>
              )}
              <ul className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 pr-2 content-start">
                {rest.map((team, index) => renderTeamRow(team, 3 + index))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
