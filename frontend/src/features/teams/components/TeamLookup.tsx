import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { useNFCReader } from '@/hooks/useNFCReader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { TeamDetails } from './TeamDetails';

const SEARCH_TEAM_QUERY = graphql(`
  query SearchTeam($searchTerm: String!) {
    searchTeam(searchTerm: $searchTerm) {
      _id
      name
      nfcCardId
      credits
      completedMissionIds
      createdAt
    }
  }
`);

interface TeamLookupProps {
  onTeamFound?: () => void;
}

export function TeamLookup({ onTeamFound }: TeamLookupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { isSupported, isReading, readNFC, checkSupport } = useNFCReader();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['team', searchTerm],
    queryFn: () => graphqlClient.request(SEARCH_TEAM_QUERY, { searchTerm }),
    enabled: false, // Only run when manually triggered
  });

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
      // Use the queryFn directly with the new NFC ID
      const response = await graphqlClient.request(SEARCH_TEAM_QUERY, {
        searchTerm: result.nfcId,
      });
      if (response?.searchTeam) {
        toast.success('Team found!');
        onTeamFound?.();
        // Trigger refetch to update the query cache
        refetch();
      } else {
        toast.error('Team not found');
      }
    } else {
      toast.error(result.error || 'Failed to read NFC card');
    }
  };

  const handleManualSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a team name or NFC card ID');
      return;
    }
    const response = await refetch();
    if (response.data?.searchTeam) {
      toast.success('Team found!');
      onTeamFound?.();
    } else {
      toast.error('Team not found');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lookup Team</CardTitle>
        <CardDescription>
          Search for a team by name or NFC card ID
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="team-search">Team Name or NFC Card ID</Label>
            <Input
              id="team-search"
              placeholder="Enter team name or NFC card ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleManualSearch();
                }
              }}
            />
          </div>
          {isSupported && (
            <div className="flex items-end">
              <Button
                onClick={handleNFCRead}
                disabled={isReading}
                variant="outline"
              >
                <Radio className="w-4 h-4 mr-2" />
                {isReading ? 'Reading...' : 'Scan NFC'}
              </Button>
            </div>
          )}
          <div className="flex items-end">
            <Button onClick={handleManualSearch} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {data?.searchTeam && (
          <TeamDetails team={data.searchTeam} onUpdate={() => refetch()} />
        )}
      </CardContent>
    </Card>
  );
}
