import { Coins, Gem, ScrollText } from 'lucide-react';
import { TeamBanner } from './TeamBanner';
import { getBannerIconById } from './banner-icons';

export type TeamCompactRowTeam = {
  _id: string;
  name: string;
  bannerColor: string;
  bannerIcon: string;
  credits: number;
  crystals: number;
  missions?: { missionId: string; status: string }[] | null;
};

interface TeamCompactRowProps {
  team: TeamCompactRowTeam;
  totalMissions: number;
  onClick: () => void;
}

export function TeamCompactRow({ team, totalMissions, onClick }: TeamCompactRowProps) {
  const completed = (team.missions ?? []).filter(m => m.status === 'COMPLETE').length;

  return (
    <li
      onClick={onClick}
      className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2.5 shadow-sm cursor-pointer hover:border-primary hover:ring-2 hover:ring-primary/20 active:scale-[0.99] transition-all"
    >
      <TeamBanner
        color={team.bannerColor}
        icon={getBannerIconById(team.bannerIcon)}
        size="sm"
        className="w-9 shrink-0"
      />
      <span className="flex-1 min-w-0 text-base font-semibold text-foreground truncate">
        {team.name}
      </span>
      <div className="flex items-center gap-3 shrink-0 text-xs">
        <span className="flex items-center gap-1" title="Credits">
          <Coins className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-semibold text-foreground tabular-nums">{team.credits}</span>
        </span>
        <span className="flex items-center gap-1" title="Missions">
          <ScrollText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-semibold text-foreground tabular-nums">
            {completed}/{totalMissions}
          </span>
        </span>
        <span className="flex items-center gap-1" title="Crystals">
          <Gem className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-semibold text-foreground tabular-nums">{team.crystals}</span>
        </span>
      </div>
    </li>
  );
}
