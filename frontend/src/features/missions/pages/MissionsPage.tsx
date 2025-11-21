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
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Missions</h1>
        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)}>
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

