import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const CREATE_MISSION_MUTATION = graphql(`
  mutation CreateMission($input: CreateMissionDto!) {
    createMission(input: $input) {
      _id
      name
      description
      creditsAwarded
      isFinalChallenge
    }
  }
`);

interface CreateMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateMissionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateMissionDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creditsAwarded, setCreditsAwarded] = useState(0);
  const [isFinalChallenge, setIsFinalChallenge] = useState(false);

  const createMission = useMutation({
    mutationFn: (input: {
      name: string;
      description?: string;
      creditsAwarded: number;
      isFinalChallenge: boolean;
    }) => graphqlClient.request(CREATE_MISSION_MUTATION, { input }),
    onSuccess: () => {
      toast.success('Mission created successfully!');
      setName('');
      setDescription('');
      setCreditsAwarded(0);
      setIsFinalChallenge(false);
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.errors?.[0]?.message || 'Failed to create mission'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Mission name is required');
      return;
    }

    createMission.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      creditsAwarded,
      isFinalChallenge,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Mission</DialogTitle>
          <DialogDescription>
            Create a new mission with name, description, and credit rewards
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="mission-name">Mission Name *</Label>
              <Input
                id="mission-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter mission name"
                required
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
                onChange={(e) =>
                  setCreditsAwarded(parseInt(e.target.value) || 0)
                }
                min="0"
                placeholder="0"
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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMission.isPending}>
              {createMission.isPending ? 'Creating...' : 'Create Mission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

