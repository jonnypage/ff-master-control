import { useState } from 'react';
import { MissionList } from '../components/MissionList';
import { CreateMissionDialog } from '../components/CreateMissionDialog';
import { useAuth } from '@/features/auth/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function MissionsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Missions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage all missions
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Mission
          </Button>
        )}
      </div>

      <MissionList />

      {isAdmin && (
        <CreateMissionDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
}
