import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { GetMissionQuery } from '@/lib/graphql/generated';

const GET_MISSION_QUERY = graphql(`
  query GetMission($id: ID!) {
    mission(id: $id) {
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

const UPDATE_MISSION_MUTATION = graphql(`
  mutation UpdateMission($id: ID!, $input: UpdateMissionDto!) {
    updateMission(id: $id, input: $input) {
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

const GET_TEAMS_FOR_MISSION_QUERY = graphql(`
  query GetTeamsForMission {
    teams {
      _id
      completedMissionIds
    }
  }
`);

export function MissionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { canEditMissions } = usePermissions();
  const queryClient = useQueryClient();
  
  // Check if we're in edit mode based on URL path
  const isEditMode = location.pathname.endsWith('/edit');
  const canEdit = canEditMissions && isEditMode;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creditsAwarded, setCreditsAwarded] = useState(0);
  const [isFinalChallenge, setIsFinalChallenge] = useState(false);

  const { data, isLoading } = useQuery<GetMissionQuery>({
    queryKey: ['mission', id],
    queryFn: () => graphqlClient.request(GET_MISSION_QUERY, { id: id! }),
    enabled: !!id,
  });

  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => graphqlClient.request(GET_TEAMS_FOR_MISSION_QUERY),
  });

  const completionCount = useMemo(() => {
    if (!teamsData?.teams || !id) return { completed: 0, total: 0 };
    const teams = (teamsData as { teams?: Array<{ completedMissionIds: string[] }> })?.teams ?? [];
    const completed = teams.filter((team) =>
      team.completedMissionIds.includes(id),
    ).length;
    return { completed, total: teams.length };
  }, [teamsData, id]);

  useEffect(() => {
    if (data?.mission) {
      setName(data.mission.name);
      setDescription(data.mission.description || '');
      setCreditsAwarded(data.mission.creditsAwarded);
      setIsFinalChallenge(data.mission.isFinalChallenge);
    }
  }, [data]);

  const updateMission = useMutation({
    mutationFn: (input: {
      name?: string;
      description?: string;
      creditsAwarded?: number;
      isFinalChallenge?: boolean;
    }) =>
      graphqlClient.request(UPDATE_MISSION_MUTATION, {
        id: id!,
        input,
      }),
    onSuccess: () => {
      toast.success('Mission updated successfully');
      queryClient.invalidateQueries({ queryKey: ['mission', id] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.errors?.[0]?.message || 'Failed to update mission'
      );
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Mission name is required');
      return;
    }

    const input: {
      name?: string;
      description?: string;
      creditsAwarded?: number;
      isFinalChallenge?: boolean;
    } = {};

    if (name !== data?.mission?.name) {
      input.name = name;
    }
    if (description !== (data?.mission?.description || '')) {
      input.description = description;
    }
    if (creditsAwarded !== data?.mission?.creditsAwarded) {
      input.creditsAwarded = creditsAwarded;
    }
    if (isFinalChallenge !== data?.mission?.isFinalChallenge) {
      input.isFinalChallenge = isFinalChallenge;
    }

    if (Object.keys(input).length === 0) {
      toast.info('No changes to save');
      return;
    }

    updateMission.mutate(input);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-8 text-gray-500">Loading mission...</div>
      </div>
    );
  }

  if (!data?.mission) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-8 text-gray-500">Mission not found</div>
        <Button onClick={() => navigate('/missions')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Missions
        </Button>
      </div>
    );
  }

  const mission = data.mission;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/missions')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Mission' : 'Mission Details'}
          </h1>
          {mission.isFinalChallenge && (
            <Badge variant="default">Final Challenge</Badge>
          )}
        </div>
        {!isEditMode && canEditMissions && (
          <Button onClick={() => navigate(`/missions/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mission Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {canEdit ? (
              <>
                <div>
                  <Label htmlFor="mission-name">Mission Name</Label>
                  <Input
                    id="mission-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter mission name"
                  />
                </div>
                <div>
                  <Label htmlFor="mission-description">Description</Label>
                  <textarea
                    id="mission-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter mission description (optional)"
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div>
                  <Label htmlFor="credits-awarded">Credits Awarded</Label>
                  <Input
                    id="credits-awarded"
                    type="number"
                    value={creditsAwarded}
                    onChange={(e) => setCreditsAwarded(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-final-challenge"
                    checked={isFinalChallenge}
                    onChange={(e) => setIsFinalChallenge(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is-final-challenge" className="cursor-pointer">
                    Final Challenge
                  </Label>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Mission Name</Label>
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                    {mission.name}
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-sm min-h-[80px]">
                    {mission.description || <span className="text-gray-400">No description</span>}
                  </div>
                </div>
                <div>
                  <Label>Credits Awarded</Label>
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                    {mission.creditsAwarded}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={mission.isFinalChallenge}
                    disabled
                    className="rounded border-gray-300"
                  />
                  <Label className="cursor-default">
                    Final Challenge
                  </Label>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completed:</span>
              <Badge variant="outline">
                {completionCount.completed}/{completionCount.total}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Created:</span>
              <span className="text-gray-900">
                {new Date(mission.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Updated:</span>
              <span className="text-gray-900">
                {new Date(mission.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {canEdit && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              onClick={() => navigate(`/missions/${id}`)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMission.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

