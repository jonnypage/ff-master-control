import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { TeamCreateForm } from '../components/TeamCreateForm';

export function CreateTeamPage() {
  const navigate = useNavigate();

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
            <TeamCreateForm
              cancelLabel="Back to Login"
              onCancel={() => navigate('/login')}
              onCreated={async (teamGuid) => {
                try {
                  await navigator.clipboard.writeText(teamGuid);
                  toast.message('Team GUID copied to clipboard');
                } catch {
                  // ignore clipboard failures
                }
                navigate('/login', { state: { teamGuid } });
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

