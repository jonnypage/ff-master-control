import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Coins, Gem } from 'lucide-react';
import { toast } from 'sonner';
import type {
  GetMissionsQuery,
  GetMissionQuery,
  GetTeamsForMissionCompletionQuery,
} from '@/lib/graphql/generated';
import { useCompleteMission } from '@/lib/api/useApi';

interface MissionCompletionProps {
  mission:
    | GetMissionsQuery['missions'][number]
    | NonNullable<GetMissionQuery['mission']>;
  team: GetTeamsForMissionCompletionQuery['teams'][number];
  onBack: () => void;
  onSuccess: () => void;
}

export function MissionCompletion({
  mission,
  team,
  onBack,
  onSuccess,
}: MissionCompletionProps) {
  const queryClient = useQueryClient();
  const isAlreadyCompleted = team.completedMissions.some(
    (cm) => cm.missionId === mission._id,
  );
  const completeMission = useCompleteMission();

  const handleComplete = () => {
    if (isAlreadyCompleted) {
      toast.error('This mission is already completed for this team');
      return;
    }
    completeMission.mutate(
      { missionId: mission._id, teamId: team._id },
      {
        onSuccess: () => {
          toast.success(
            `Mission "${mission.name}" marked as complete for ${team.name}`,
          );
          queryClient.invalidateQueries({ queryKey: ['missions'] });
          queryClient.invalidateQueries({ queryKey: ['teams'] });
          onSuccess();
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message ||
            'Failed to mark mission as complete';
          toast.error(errorMessage);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Mark Mission Complete
          </h2>
          <p className="text-sm text-muted-foreground">
            {mission.name} - {team.name}
          </p>
        </div>
      </div>

      {/* Mission Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Mission Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Mission Name
            </span>
            <span className="text-foreground font-semibold">
              {mission.name}
            </span>
          </div>
          {mission.description && (
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Description
              </span>
              <span className="text-foreground text-sm text-right max-w-md">
                {mission.description}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="w-4 h-4 shrink-0" />
              Credits Awarded
            </span>
            <Badge
              variant="default"
              className="text-lg font-semibold px-4 py-2"
            >
              {mission.creditsAwarded}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gem className="w-4 h-4 shrink-0" />
              Crystal Reward
            </span>
            <Badge
              variant={mission.awardsCrystal ? 'default' : 'secondary'}
              className="text-lg font-semibold px-4 py-2"
            >
              {mission.awardsCrystal ? '1 Crystal' : 'None'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Team Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Team Name
            </span>
            <span className="text-foreground font-semibold">{team.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="w-4 h-4 shrink-0" />
              Current Credits
            </span>
            <Badge
              variant="secondary"
              className="text-lg font-semibold px-4 py-2"
            >
              {team.credits.toLocaleString()}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gem className="w-4 h-4 shrink-0" />
              Current Crystals
            </span>
            <Badge
              variant="secondary"
              className="text-lg font-semibold px-4 py-2"
            >
              {team.crystals.toLocaleString()}
            </Badge>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="w-4 h-4 shrink-0" />
              New Credits After Completion
            </span>
            <Badge
              variant="default"
              className="text-lg font-semibold px-4 py-2"
            >
              {(team.credits + mission.creditsAwarded).toLocaleString()}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gem className="w-4 h-4 shrink-0" />
              New Crystals After Completion
            </span>
            <Badge
              variant="default"
              className="text-lg font-semibold px-4 py-2"
            >
              {(team.crystals + (mission.awardsCrystal ? 1 : 0)).toLocaleString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status and Action */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAlreadyCompleted ? (
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Badge
                variant="default"
                className="text-lg font-semibold px-4 py-2 mb-2"
              >
                Mission Already Completed
              </Badge>
              <p className="text-sm text-muted-foreground">
                This team has already completed this mission.
              </p>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Status</span>
                <Badge variant="outline">Not Completed</Badge>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                <span className="text-muted-foreground">After Completion</span>
                <Badge variant="default">Completed</Badge>
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={handleComplete}
            disabled={completeMission.isPending || isAlreadyCompleted}
            size="lg"
            className="w-full"
          >
            <Check className="w-5 h-5 mr-2" />
            {completeMission.isPending
              ? 'Marking Complete...'
              : isAlreadyCompleted
                ? 'Already Completed'
                : 'Mark Mission Complete'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
