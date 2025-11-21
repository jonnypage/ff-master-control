import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import type { GetMissionsQuery } from '@/lib/graphql/generated';

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

export function MissionList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['missions'],
    queryFn: () => graphqlClient.request(GET_MISSIONS_QUERY),
  });

  const filteredMissions = useMemo(() => {
    if (!data?.missions) return [];
    if (!searchTerm.trim()) return data.missions;

    const searchLower = searchTerm.toLowerCase();
    return data.missions.filter((mission) =>
      mission.name.toLowerCase().includes(searchLower) ||
      mission.description?.toLowerCase().includes(searchLower)
    );
  }, [data?.missions, searchTerm]);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading missions...</div>;
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
