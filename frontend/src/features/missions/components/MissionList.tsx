import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Target } from 'lucide-react';

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
      (teamsData as { teams?: Array<{ completedMissionIds?: string[] }> })
        ?.teams ?? [];
    const totalTeams = teams.length;

    if (totalTeams === 0) {
      return { counts: {}, totalTeams: 0 };
    }

    data?.missions?.forEach((mission) => {
      const completedCount = teams.filter(
        (team: { completedMissionIds?: string[] }) =>
          team.completedMissionIds?.includes(mission._id) ?? false,
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading missions...</p>
        </div>
      </div>
    );
  }

  if (!data?.missions || data.missions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">No missions found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a mission to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search missions by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMissions.map((mission) => (
          <Card
            key={mission._id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
            onClick={() => navigate(`/missions/${mission._id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {mission.name}
                </CardTitle>
                {mission.isFinalChallenge && (
                  <Badge variant="default">Final</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mission.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {mission.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Credits
                </span>
                <Badge
                  variant="secondary"
                  className="text-base font-semibold px-3 py-1"
                >
                  {mission.creditsAwarded}
                </Badge>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium text-muted-foreground">
                  Completed
                </span>
                <Badge
                  variant="outline"
                  className="text-base font-semibold px-3 py-1"
                >
                  {completionCounts.counts?.[mission._id] ?? 0}/
                  {completionCounts.totalTeams ?? 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMissions.length === 0 && searchTerm && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">No missions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              No missions matching "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
