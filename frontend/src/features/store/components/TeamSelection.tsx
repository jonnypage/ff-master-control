import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users } from 'lucide-react';
import type { GetTeamsForStoreQuery } from '@/lib/graphql/generated';
import { useTeamsForStore } from '@/lib/api/useApi';

interface TeamSelectionProps {
  onTeamSelect: (team: GetTeamsForStoreQuery['teams'][number]) => void;
}

export function TeamSelection({ onTeamSelect }: TeamSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useTeamsForStore();

  const filteredTeams = useMemo(() => {
    const allTeams = (data?.teams ?? []) as GetTeamsForStoreQuery['teams'];
    if (!searchTerm.trim()) return allTeams;

    const searchLower = searchTerm.toLowerCase();
    return allTeams.filter(
      (team: GetTeamsForStoreQuery['teams'][number]) =>
        team.name.toLowerCase().includes(searchLower),
    );
  }, [data?.teams, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (!data?.teams || data.teams.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">No teams found</p>
          <p className="text-sm text-muted-foreground mt-1">
            No teams available to adjust credits for
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search teams by name or team ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team: GetTeamsForStoreQuery['teams'][number]) => (
          <Card
            key={team._id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
            onClick={() => onTeamSelect(team)}
          >
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
                  {(team.credits ?? 0).toLocaleString()}
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Team ID:</span>{' '}
                  <code className="bg-muted px-2 py-1 rounded font-mono">
                    {team._id}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && searchTerm && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">No teams found</p>
            <p className="text-sm text-muted-foreground mt-1">
              No teams matching "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
