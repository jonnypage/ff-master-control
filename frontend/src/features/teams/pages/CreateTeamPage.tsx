import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCreateTeam } from '@/lib/api/useApi';

export function CreateTeamPage() {
  const navigate = useNavigate();
  const createTeam = useCreateTeam();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !pin.trim() || !confirmPin.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    createTeam.mutate(
      { input: { name: name.trim(), pin } },
      {
        onSuccess: async (data) => {
          const teamGuid = data?.createTeam?.teamGuid;
          toast.success('Team created!');
          if (teamGuid) {
            try {
              await navigator.clipboard.writeText(teamGuid);
              toast.message('Team GUID copied to clipboard');
            } catch {
              // ignore clipboard failures
            }
            navigate('/login', { state: { teamGuid } });
          }
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message || 'Failed to create team';
          toast.error(errorMessage);
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Create a Team</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a team name and a 4-digit PIN to share with teammates.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter team name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">4-digit PIN</Label>
                <Input
                  id="pin"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-pin">Confirm PIN</Label>
                <Input
                  id="confirm-pin"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="1234"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createTeam.isPending}
                >
                  {createTeam.isPending ? 'Creating...' : 'Create Team'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

