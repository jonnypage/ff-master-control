import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, LogIn } from 'lucide-react';
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

export function LeaderboardPage() {
  const navigate = useNavigate();

  // Poll every 3 seconds for real-time updates
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

  const sortedTeams = useMemo(() => {
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
        (
          team,
        ): LeaderboardTeam & {
          completedCount: number;
          totalMissions: number;
          hasCompletedFinal: boolean;
        } => ({
          ...team,
          completedCount: team.completedMissionIds?.length ?? 0,
          totalMissions,
          hasCompletedFinal: finalChallengeIds.some((id) =>
            team.completedMissionIds?.includes(id),
          ),
        }),
      )
      .sort((a, b) => {
        // Sort by completed missions (descending), then by name
        if (b.completedCount !== a.completedCount) {
          return b.completedCount - a.completedCount;
        }
        return a.name.localeCompare(b.name);
      });
  }, [teamsData?.leaderboardTeams, missionsData?.leaderboardMissions]);

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return null;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header with Login Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={() => navigate('/login')}
          variant="outline"
          size="lg"
          className="shadow-lg"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Login
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy className="w-16 h-16 text-primary" />
            <h1 className="text-6xl md:text-7xl font-bold text-foreground">
              Leaderboard
            </h1>
            <Trophy className="w-16 h-16 text-primary" />
          </div>
          <p className="text-2xl md:text-3xl text-muted-foreground font-medium">
            Mission Completion Rankings
          </p>
        </div>

        {/* Teams List */}
        <div className="max-w-5xl mx-auto space-y-4">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-2xl text-muted-foreground">
                Loading leaderboard...
              </p>
            </div>
          ) : hasError ? (
            <div className="text-center py-20">
              <p className="text-2xl text-destructive">
                Error loading leaderboard
              </p>
              <p className="text-lg text-muted-foreground mt-2">
                Please refresh the page
              </p>
            </div>
          ) : sortedTeams.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-muted-foreground">No teams yet</p>
            </div>
          ) : (
            sortedTeams.map((team, index) => {
              const rankIcon = getRankIcon(index);
              const rankColor = getRankColor(index);
              const percentage =
                team.totalMissions > 0
                  ? Math.round((team.completedCount / team.totalMissions) * 100)
                  : 0;

              return (
                <div
                  key={team._id}
                  className={`bg-card border-2 rounded-lg p-6 md:p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${
                    index < 3
                      ? 'border-primary scale-[1.02]'
                      : 'border-border scale-100'
                  } ${team.hasCompletedFinal ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
                >
                  <div className="flex items-center justify-between gap-6">
                    {/* Rank and Name */}
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div
                        className={`text-4xl md:text-5xl font-bold flex-shrink-0 ${rankColor}`}
                      >
                        {rankIcon || `#${index + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4">
                          <TeamBanner
                            color={team.bannerColor}
                            icon={getBannerIconById(team.bannerIcon)}
                            size="sm"
                            className="hidden sm:block"
                          />
                          <h2 className="text-3xl md:text-4xl font-bold text-foreground truncate">
                            {team.name}
                          </h2>
                          {team.hasCompletedFinal && (
                            <span className="inline-flex items-center rounded-full bg-yellow-500/20 text-yellow-700 px-3 py-1 text-sm font-semibold">
                              Final Challenge
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-4xl md:text-5xl font-bold text-primary">
                          {team.completedCount}
                        </div>
                        <div className="text-lg md:text-xl text-muted-foreground font-medium">
                          / {team.totalMissions} missions
                        </div>
                      </div>
                      <div className="w-24 md:w-32">
                        <div className="text-right text-2xl md:text-3xl font-bold text-foreground mb-1">
                          {percentage}%
                        </div>
                        <div className="h-4 md:h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              index === 0
                                ? 'bg-yellow-500'
                                : index === 1
                                  ? 'bg-gray-400'
                                  : index === 2
                                    ? 'bg-amber-600'
                                    : 'bg-primary'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground">
            Updated every 3 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
