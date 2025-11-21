import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Edit, Target } from 'lucide-react';
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading mission...</p>
        </div>
      </div>
    );
  }

  if (!data?.mission) {
    return (
      <div className="space-y-4">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">Mission not found</p>
            <Button onClick={() => navigate('/missions')} variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Missions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mission = data.mission;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/missions')} variant="outline" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                {isEditMode ? 'Edit Mission' : 'Mission Details'}
              </h1>
              {mission.isFinalChallenge && (
                <Badge variant="default">
                  Final Challenge
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditMode ? 'Update mission information' : 'View mission information'}
            </p>
          </div>
        </div>
        {!isEditMode && canEditMissions && (
          <Button onClick={() => navigate(`/missions/${id}/edit`)} size="lg" className="shadow-md">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <div className="max-w-3xl space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-xl">Mission Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
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
                    className="rounded border-input"
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
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {mission.name}
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm min-h-[80px]">
                    {mission.description || <span className="text-muted-foreground">No description</span>}
                  </div>
                </div>
                <div>
                  <Label>Credits Awarded</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {mission.creditsAwarded}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={mission.isFinalChallenge}
                    disabled
                    className="rounded border-input"
                  />
                  <Label className="cursor-default">
                    Final Challenge
                  </Label>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-xl">Mission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed:</span>
              <Badge variant="outline">
                {completionCount.completed}/{completionCount.total}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Created:</span>
              <span className="text-foreground">
                {new Date(mission.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="text-foreground">
                {new Date(mission.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {canEdit && (
          <div className="flex justify-end gap-3 pt-6 border-t bg-card p-4 rounded-lg shadow-sm -mx-4 -mb-4">
            <Button
              onClick={() => navigate(`/missions/${id}`)}
              variant="outline"
              size="lg"
              className="min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMission.isPending}
              size="lg"
              className="min-w-[120px] shadow-md"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMission.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

