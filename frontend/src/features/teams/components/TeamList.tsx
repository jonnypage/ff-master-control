import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Radio } from 'lucide-react';
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
    // @ts-expect-error - GET_MISSIONS_FOR_TEAMS_QUERY types will be generated after running codegen
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
      <div className="text-center py-8 text-gray-500">Loading teams...</div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No teams found. Create a team to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search teams by name or NFC card ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {isSupported && (
          <Button
            onClick={handleNFCRead}
            disabled={isReading}
            variant="outline"
          >
            <Radio className="w-4 h-4 mr-2" />
            {isReading ? 'Reading...' : 'Scan NFC'}
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team: GetTeamsQuery['teams'][number]) => (
          <Card
            key={team._id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/teams/${team._id}`)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{team.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Credits:</span>
                <Badge variant="secondary">{team.credits}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Missions:</span>
                <Badge>
                  {team.completedMissionIds.length}/{totalMissions}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Card ID:{' '}
                <code className="bg-gray-100 px-1 rounded">
                  {team.nfcCardId}
                </code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          No teams found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}
