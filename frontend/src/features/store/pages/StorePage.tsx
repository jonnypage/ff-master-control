import { useState } from 'react';
import { TeamSelection } from '../components/TeamSelection';
import { CreditAdjustment } from '../components/CreditAdjustment';
import type { GetTeamsForStoreQuery } from '@/lib/graphql/generated';

export function StorePage() {
  const [selectedTeam, setSelectedTeam] = useState<
    GetTeamsForStoreQuery['teams'][number] | null
  >(null);

  const handleTeamSelect = (team: GetTeamsForStoreQuery['teams'][number]) => {
    setSelectedTeam(team);
  };

  const handleBack = () => {
    setSelectedTeam(null);
  };

  const handleSuccess = () => {
    setSelectedTeam(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Store</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust team credits using NFC cards or team search
        </p>
      </div>

      {selectedTeam ? (
        <CreditAdjustment
          team={selectedTeam}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      ) : (
        <TeamSelection onTeamSelect={handleTeamSelect} />
      )}
    </div>
  );
}
