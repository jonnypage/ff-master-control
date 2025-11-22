import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Radio, Users } from 'lucide-react';
import { useNFCReader } from '@/hooks/useNFCReader';
import { toast } from 'sonner';
import type { GetTeamsQuery } from '@/lib/graphql/generated';

const GET_MISSIONS_FOR_TEAMS_QUERY = graphql(`
  query GetMissionsForTeams {
    missions {
      _id
    }
  }
`);

interface TeamListProps {
  teams: GetTeamsQuery['teams'];
  isLoading: boolean;
  onUpdate?: () => void;
}

export function TeamList({ teams, isLoading, onUpdate }: TeamListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { isSupported, isReading, readNFC, checkSupport } = useNFCReader();

  const { data: missionsData } = useQuery({
    queryKey: ['missions'],
    queryFn: () => graphqlClient.request(GET_MISSIONS_FOR_TEAMS_QUERY),
  });

  const totalMissions = missionsData?.missions?.length ?? 0;

  const filteredTeams = useMemo(() => {
    const allTeams = teams ?? [];
    if (!searchTerm.trim()) return allTeams;

    const searchLower = searchTerm.toLowerCase();
    return allTeams.filter(
      (team) =>
        team.name.toLowerCase().includes(searchLower) ||
        team.nfcCardId.toLowerCase().includes(searchLower),
    );
  }, [teams, searchTerm]);

  const handleNFCRead = async () => {
    if (!isSupported) {
      checkSupport();
      if (!isSupported) {
        toast.error('NFC is not supported on this device');
        return;
      }
    }

    const result = await readNFC();
    if (result.success && result.nfcId) {
      setSearchTerm(result.nfcId);
      const foundTeam = teams.find(
        (team) => team.nfcCardId.toLowerCase() === result.nfcId?.toLowerCase(),
      );
      if (foundTeam) {
        toast.success('Team found!');
        onUpdate?.();
      } else {
        toast.error('Team not found');
      }
    } else {
      toast.error(result.error || 'Failed to read NFC card');
    }
  };

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
            placeholder="Search teams by name or NFC card ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        {isSupported && (
          <Button
            onClick={handleNFCRead}
            disabled={isReading}
            variant="outline"
            className="h-11"
          >
            <Radio className="w-4 h-4 mr-2" />
            {isReading ? 'Reading...' : 'Scan NFC'}
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team: GetTeamsQuery['teams'][number]) => (
          <Card
            key={team._id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
            onClick={() => navigate(`/teams/${team._id}`)}
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
                  {team.credits}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Missions
                </span>
                <Badge className="text-base font-semibold px-3 py-1">
                  {team.completedMissionIds.length}/{totalMissions}
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Card ID:</span>{' '}
                  <code className="bg-muted px-2 py-1 rounded font-mono">
                    {team.nfcCardId}
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
