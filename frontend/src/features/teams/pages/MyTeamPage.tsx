import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMyTeam, useMissionsForTeams } from '@/lib/api/useApi';
import { TeamBanner } from '../components/TeamBanner';
import { getBannerIconById } from '../components/banner-icons';
import QRCode from 'qrcode';
import { ChevronDown, Coins, Gem, ScrollText } from 'lucide-react';

export function MyTeamPage() {
  const { data, isLoading, refetch } = useMyTeam({ refetchInterval: 30000 });
  const { data: missionsData } = useMissionsForTeams();

  const team = data?.myTeam;
  const totalMissions = missionsData?.missions?.length ?? 0;

  const inviteUrl = useMemo(() => {
    if (!team?.teamCode) return null;
    try {
      const url = new URL('/', window.location.origin);
      url.searchParams.set('teamCode', team.teamCode);
      return url.toString();
    } catch {
      return null;
    }
  }, [team]);

  const inviteQr = useQuery({
    queryKey: ['team-invite-qr', inviteUrl],
    enabled: !!inviteUrl,
    queryFn: async () => {
      if (!inviteUrl) throw new Error('Missing invite URL');
      return await QRCode.toDataURL(inviteUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256,
      });
    },
  });

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
            Please log in with your Team Code and PIN.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  const completedCount =
    team.missions?.filter((m: any) => m.status === 'COMPLETE').length ?? 0;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(team.teamCode);
      toast.success('Team Code copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCopyInviteLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invite link copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{team.name}</h1>
      </div>

      <Card>
        <CardHeader></CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <TeamBanner
            color={team.bannerColor}
            icon={getBannerIconById(team.bannerIcon)}
            size="sm"
          />
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-1">
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Team Code
              </span>
              <code className="bg-muted px-3 py-2 rounded font-mono text-sm text-center">
                {team.teamCode}
              </code>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Team PIN
              </span>
              <code className="bg-muted px-3 py-2 rounded font-mono text-sm text-center">
                {team.pin ?? '••••'}
              </code>
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
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="w-4 h-4 shrink-0" />
              Credits
            </span>
            <Badge variant="secondary" className="text-base font-semibold">
              {team.credits?.toLocaleString?.() ?? team.credits}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gem className="w-4 h-4 shrink-0" />
              Crystals
            </span>
            <Badge variant="secondary" className="text-base font-semibold">
              {team.crystals?.toLocaleString?.() ?? team.crystals}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ScrollText className="w-4 h-4 shrink-0" />
              Missions
            </span>
            <Badge className="text-base font-semibold">
              {completedCount}/{totalMissions}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <details className="group">
          <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invite a Teammate</CardTitle>
              <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180" />
            </CardHeader>
          </summary>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code to open the login screen with your Team Code
              filled in. Your teammate will still need the 4-digit PIN.
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="w-56 h-56 rounded-lg border bg-background flex items-center justify-center overflow-hidden">
                {inviteQr.data ? (
                  <img
                    src={inviteQr.data}
                    alt="Team invite QR code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center px-4">
                    {inviteQr.isError ? (
                      <p className="text-sm text-destructive">
                        Failed to generate QR code
                      </p>
                    ) : (
                      <>
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-3"></div>
                        <p className="text-sm text-muted-foreground">
                          Generating QR…
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyInviteLink}
                  disabled={!inviteUrl}
                >
                  Copy Invite Link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyCode}
                >
                  Copy Team Code
                </Button>
              </div>
            </div>
          </CardContent>
        </details>
      </Card>
    </div>
  );
}
