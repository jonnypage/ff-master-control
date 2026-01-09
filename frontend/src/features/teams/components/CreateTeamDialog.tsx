import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { TeamCreateForm } from './TeamCreateForm';

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTeamDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a new team
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <TeamCreateForm
            cancelLabel="Cancel"
            submitLabel="Create Team"
            onCancel={() => onOpenChange(false)}
            onCreated={(teamGuid) => {
              toast.message(`Team GUID: ${teamGuid}`);
              onSuccess();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
