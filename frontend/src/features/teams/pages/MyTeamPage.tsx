import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMyTeam, useMissionsForTeams } from '@/lib/api/useApi';

export function MyTeamPage() {
  const { data, isLoading, refetch } = useMyTeam();
  const { data: missionsData } = useMissionsForTeams();

  const team = data?.myTeam;
  const totalMissions = missionsData?.missions?.length ?? 0;

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

  if (!team) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-foreground font-medium">No team session found</p>
          <p className="text-sm text-muted-foreground">
            Please log in with your Team GUID and PIN.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  const completedCount = team.completedMissionIds?.length ?? 0;

  const handleCopyGuid = async () => {
    try {
      await navigator.clipboard.writeText(team.teamGuid);
      toast.success('Team GUID copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Team</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your progress for today’s event.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Team Name
            </span>
            <span className="text-foreground font-semibold">{team.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Team GUID
            </span>
            <div className="flex items-center gap-2">
              <code className="bg-muted px-2 py-1 rounded font-mono text-xs">
                {team.teamGuid}
              </code>
              <Button size="sm" variant="outline" onClick={handleCopyGuid}>
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Credits
            </span>
            <Badge variant="secondary" className="text-base font-semibold">
              {team.credits?.toLocaleString?.() ?? team.credits}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Missions
            </span>
            <Badge className="text-base font-semibold">
              {completedCount}/{totalMissions}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

