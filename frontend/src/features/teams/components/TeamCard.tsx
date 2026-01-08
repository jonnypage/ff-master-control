import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GetTeamsQuery } from '@/lib/graphql/generated';

type TeamWithProgress = GetTeamsQuery['teams'][number] & {
  completedMissionIds?: string[];
};

interface TeamCardProps {
  team: TeamWithProgress;
  totalMissions: number;
  onClick: () => void;
}

export function TeamCard({ team, totalMissions, onClick }: TeamCardProps) {
  return (
    <div className="cursor-pointer group" onClick={onClick}>
      <Card className="h-full hover:!border-primary hover:ring-2 hover:ring-primary/30 hover:shadow-xl transition-all duration-200 active:scale-[0.98] group-hover:[background-color:hsl(var(--accent)/0.35)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {team.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
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
            <span className="text-sm font-medium text-muted-foreground">
              Missions
            </span>
            <Badge className="text-base font-semibold px-3 py-1">
              {(team.completedMissionIds ?? []).length}/{totalMissions}
            </Badge>
          </div>
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Team GUID:</span>{' '}
              <code className="bg-muted px-2 py-1 rounded font-mono">
                {team.teamGuid}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
