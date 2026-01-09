import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import type { GetTeamsQuery } from '@/lib/graphql/generated';
import { useMissionsForTeams } from '@/lib/api/useApi';
import { TeamCard } from './TeamCard';

type TeamWithProgress = GetTeamsQuery['teams'][number] & {
  completedMissionIds?: string[];
};

interface TeamListProps {
  teams: TeamWithProgress[];
  isLoading: boolean;
}

export function TeamList({ teams, isLoading }: TeamListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: missionsData } = useMissionsForTeams();

  const totalMissions = missionsData?.missions?.length ?? 0;

  const filteredTeams = useMemo(() => {
    const allTeams = (teams ?? []) as TeamWithProgress[];
    if (!searchTerm.trim()) return allTeams;

    const searchLower = searchTerm.toLowerCase();
    return allTeams.filter(
      (team) =>
        team.name.toLowerCase().includes(searchLower) ||
        team.teamCode.toLowerCase().includes(searchLower),
    );
  }, [teams, searchTerm]);

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

  if (!teams || teams.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">No teams found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a team to get started
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
        {filteredTeams.map((team: TeamWithProgress) => (
          <TeamCard
            key={team._id}
            team={team}
            totalMissions={totalMissions}
            onClick={() => navigate(`/teams/${team._id}`)}
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
