import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Gem, ScrollText } from 'lucide-react';
import { TeamBanner } from './TeamBanner';
import { getBannerIconById } from './banner-icons';

export type TeamCardTeam = {
  _id: string;
  name: string;
  credits: number;
  crystals: number;
  teamCode: string;
  bannerColor: string;
  bannerIcon: string;
  missions?: { missionId: string; status: string }[] | null;
};

interface TeamCardProps {
  team: TeamCardTeam;
  totalMissions: number;
  onClick: () => void;
}

export function TeamCard({ team, totalMissions, onClick }: TeamCardProps) {
  return (
    <div className="cursor-pointer group" onClick={onClick}>
      <Card className="h-full hover:!border-primary hover:ring-2 hover:ring-primary/30 hover:shadow-xl transition-all duration-200 active:scale-[0.98] group-hover:[background-color:hsl(var(--accent)/0.35)]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {team.name}
            </CardTitle>
            <TeamBanner
              color={team.bannerColor}
              icon={getBannerIconById(team.bannerIcon)}
              size="sm"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="w-4 h-4 shrink-0" />
              Credits
            </span>
            <Badge
              variant="secondary"
              className="text-base font-semibold px-3 py-1"
            >
              {team.credits}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gem className="w-4 h-4 shrink-0" />
              Crystals
            </span>
            <Badge
              variant="secondary"
              className="text-base font-semibold px-3 py-1"
            >
              {team.crystals}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ScrollText className="w-4 h-4 shrink-0" />
              Missions
            </span>
            <Badge className="text-base font-semibold px-3 py-1">
              {
                (team.missions ?? []).filter((m) => m.status === 'COMPLETE')
                  .length
              }
              /{totalMissions}
            </Badge>
          </div>
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Team Code:</span>{' '}
              <code className="bg-muted px-2 py-1 rounded font-mono">
                {team.teamCode}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
