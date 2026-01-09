import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import type { GetTeamsForStoreQuery } from '@/lib/graphql/generated';
import { useMissionsForTeams, useTeamsForStore } from '@/lib/api/useApi';
import { TeamCard } from '@/features/teams/components/TeamCard';

interface TeamSelectionProps {
  onTeamSelect: (team: GetTeamsForStoreQuery['teams'][number]) => void;
}

export function TeamSelection({ onTeamSelect }: TeamSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useTeamsForStore();
  const { data: missionsData } = useMissionsForTeams();
  const totalMissions = missionsData?.missions?.length ?? 0;

  const filteredTeams = useMemo(() => {
    const allTeams = (data?.teams ?? []) as GetTeamsForStoreQuery['teams'];
    if (!searchTerm.trim()) return allTeams;

    const searchLower = searchTerm.toLowerCase();
    return allTeams.filter(
      (team: GetTeamsForStoreQuery['teams'][number]) =>
        team.name.toLowerCase().includes(searchLower) ||
        team.teamCode.toLowerCase().includes(searchLower),
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
            placeholder="Search teams by name or team code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team: GetTeamsForStoreQuery['teams'][number]) => (
          <TeamCard
            key={team._id}
            team={team}
            totalMissions={totalMissions}
            onClick={() => onTeamSelect(team)}
          />
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
