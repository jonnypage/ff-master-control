import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Clock, Plus, X } from 'lucide-react';
import { TeamBanner } from '@/features/teams/components/TeamBanner';
import { getBannerIconById } from '@/features/teams/components/banner-icons';
import { MissionTimer } from './MissionTimer';

interface MissionManagementFlyoutTeam {
  _id: string;
  name: string;
  bannerColor: string;
  bannerIcon: string;
  missions: {
    missionId: string;
    status: string;
    startedAt?: string;
    tries: number;
  }[];
}

interface MissionManagementFlyoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: MissionManagementFlyoutTeam | null;
  missionId: string;
  missionName?: string;
  missionDuration: number;
  missionEntry: { startedAt?: string } | undefined;
  onComplete: (teamId: string) => void;
  onFail: (teamId: string) => void;
  onAddMinute: (teamId: string) => void;
  completingTeamId: string | null;
  isCompleting: boolean;
  isFailing: boolean;
  isAddingMinute: boolean;
}

export function MissionManagementFlyout({
  open,
  onOpenChange,
  team,
  missionName,
  missionDuration,
  missionEntry,
  onComplete,
  onFail,
  onAddMinute,
  completingTeamId,
  isCompleting,
  isFailing,
  isAddingMinute,
}: MissionManagementFlyoutProps) {
  const missionLabel = missionName ?? 'Mission';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-left">
          {team && (
            <div className="flex items-center gap-3">
              <TeamBanner
                color={team.bannerColor}
                icon={getBannerIconById(team.bannerIcon)}
                size="sm"
                className="w-10 shrink-0"
              />
              <div className="text-left min-w-0">
                <DialogTitle className="text-left">{team.name}</DialogTitle>
                <DialogDescription className="text-left">
                  {missionLabel} in progress
                </DialogDescription>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Timer */}
        {missionEntry?.startedAt && missionDuration > 0 ? (
          <div className="flex items-center justify-center gap-3 py-6">
            <Clock className="w-8 h-8 text-muted-foreground shrink-0" />
            <MissionTimer
              startedAt={missionEntry.startedAt}
              duration={missionDuration}
              className="text-6xl font-bold tabular-nums"
              onExpire={() => team && onFail(team._id)}
            />
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            Mission running
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-4 py-4">
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => team && onAddMinute(team._id)}
            disabled={isAddingMinute}
          >
            <Plus className="w-5 h-5 mr-2" /> Add 1 Minute
          </Button>
          <Button
            size="lg"
            variant="destructive"
            className="w-full"
            onClick={() => team && onFail(team._id)}
            disabled={isFailing}
          >
            <X className="w-5 h-5 mr-2" /> Fail Mission
          </Button>
          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => team && onComplete(team._id)}
            disabled={completingTeamId === team?._id || isCompleting}
          >
            <Check className="w-5 h-5 mr-2" />
            {completingTeamId === team?._id ? 'Completing...' : 'Complete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
