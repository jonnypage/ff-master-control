import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { TeamBanner } from '@/features/teams/components/TeamBanner';
import { getBannerIconById } from '@/features/teams/components/banner-icons';

const JOIN_URL = 'https://ff.pocketsized.ca';

type JoinScreenTeam = {
  _id: string;
  name: string;
  bannerColor: string;
  bannerIcon: string;
};

type LeaderboardJoinScreenProps = {
  teams: JoinScreenTeam[];
};

export function LeaderboardJoinScreen({ teams }: LeaderboardJoinScreenProps) {
  const qrDataUrl = useQuery({
    queryKey: ['leaderboard-join-qr', JOIN_URL],
    queryFn: async () =>
      QRCode.toDataURL(JOIN_URL, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 1024,
      }),
  });

  const renderTeamCard = (team: JoinScreenTeam) => (
    <li
      key={team._id}
      className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-2.5 shadow-sm"
    >
      <TeamBanner
        color={team.bannerColor}
        icon={getBannerIconById(team.bannerIcon)}
        size="sm"
        className="w-10 shrink-0"
      />
      <span className="flex-1 text-lg font-semibold text-foreground truncate">
        {team.name}
      </span>
    </li>
  );

  return (
    <div className="leaderboard-page flex flex-col bg-gradient-to-br from-background via-background to-muted/20 overflow-y-auto md:overflow-hidden">
      <div className="flex flex-col md:flex-1 container mx-auto px-6 py-4 md:min-h-0 w-full max-w-7xl">
        <div className="text-center shrink-0 py-2">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Join the Freedom Fighters
          </h1>
        </div>

        <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-8 md:gap-12 items-center md:items-start">
          {/* QR Code */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-72 h-72 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] rounded-lg border bg-background flex items-center justify-center overflow-hidden">
              {qrDataUrl.data ? (
                <img
                  src={qrDataUrl.data}
                  alt={`QR code to ${JOIN_URL}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center px-4">
                  {qrDataUrl.isError ? (
                    <p className="text-sm text-destructive">
                      Failed to generate QR
                    </p>
                  ) : (
                    <>
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Generating…
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="text-base sm:text-lg text-muted-foreground mt-3 text-center font-mono">
              or go to {JOIN_URL}
            </p>
          </div>

          {/* Teams that have joined */}
          <div className="flex-1 min-w-0 w-full flex flex-col">
            {teams.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-2xl">
                It's quiet here...
              </p>
            ) : (
              <ul className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 pr-2 content-start">
                {teams.map((team) => renderTeamCard(team))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
