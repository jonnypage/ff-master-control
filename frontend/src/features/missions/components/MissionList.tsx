import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

const GET_MISSIONS_QUERY = graphql(`
  query GetMissions {
    missions {
      _id
      name
      description
      creditsAwarded
      isFinalChallenge
      createdAt
      updatedAt
    }
  }
`);

const GET_TEAMS_FOR_MISSIONS_QUERY = graphql(`
  query GetTeamsForMissions {
    teams {
      _id
      completedMissionIds
    }
  }
`);

export function MissionList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['missions'],
    queryFn: () => graphqlClient.request(GET_MISSIONS_QUERY),
  });

  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => graphqlClient.request(GET_TEAMS_FOR_MISSIONS_QUERY),
  });

  const completionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const teams =
      (teamsData as { teams?: Array<{ completedMissionIds: string[] }> })
        ?.teams ?? [];
    const totalTeams = teams.length;

    if (totalTeams === 0) {
      return { counts: {}, totalTeams: 0 };
    }

    data?.missions?.forEach((mission) => {
      const completedCount = teams.filter(
        (team: { completedMissionIds: string[] }) =>
          team.completedMissionIds.includes(mission._id),
      ).length;
      counts[mission._id] = completedCount;
    });

    return { counts, totalTeams };
  }, [data?.missions, teamsData]);

  const filteredMissions = useMemo(() => {
    const missions = data?.missions ?? [];
    if (!searchTerm.trim()) return missions;

    const searchLower = searchTerm.toLowerCase();
    return missions.filter(
      (mission) =>
        mission.name.toLowerCase().includes(searchLower) ||
        mission.description?.toLowerCase().includes(searchLower),
    );
  }, [data?.missions, searchTerm]);

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading missions...</div>
    );
  }

  if (!data?.missions || data.missions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No missions found. Create a mission to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search missions by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMissions.map((mission) => (
          <Card
            key={mission._id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/missions/${mission._id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{mission.name}</CardTitle>
                {mission.isFinalChallenge && (
                  <Badge variant="default">Final</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {mission.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {mission.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Credits Awarded:</span>
                <Badge variant="secondary">{mission.creditsAwarded}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Completed:</span>
                <Badge variant="outline">
                  {completionCounts.counts?.[mission._id] ?? 0}/
                  {completionCounts.totalTeams ?? 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMissions.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          No missions found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}
