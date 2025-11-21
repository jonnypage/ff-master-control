import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/lib/auth-context';
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

export function MissionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creditsAwarded, setCreditsAwarded] = useState(0);
  const [isFinalChallenge, setIsFinalChallenge] = useState(false);

  const { data, isLoading } = useQuery<GetMissionQuery>({
    queryKey: ['mission', id],
    queryFn: () => graphqlClient.request(GET_MISSION_QUERY, { id: id! }),
    enabled: !!id,
  });

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
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={() => navigate('/missions')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Mission</h1>
        {mission.isFinalChallenge && (
          <Badge variant="default">Final Challenge</Badge>
        )}
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mission Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mission-name">Mission Name</Label>
              <Input
                id="mission-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isAdmin}
                placeholder="Enter mission name"
              />
            </div>
            <div>
              <Label htmlFor="mission-description">Description</Label>
              <textarea
                id="mission-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isAdmin}
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
                disabled={!isAdmin}
                min="0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-final-challenge"
                checked={isFinalChallenge}
                onChange={(e) => setIsFinalChallenge(e.target.checked)}
                disabled={!isAdmin}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is-final-challenge" className="cursor-pointer">
                Final Challenge
              </Label>
            </div>
            {isAdmin && (
              <Button
                onClick={handleSave}
                disabled={updateMission.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
      </div>
    </div>
  );
}

