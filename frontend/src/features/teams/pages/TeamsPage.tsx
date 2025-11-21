import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { graphqlClient } from '@/lib/graphql/client'
import { graphql } from '@/lib/graphql/generated'
import { useNFCReader } from '@/hooks/useNFCReader'
import { TeamLookup } from '../components/TeamLookup'
import { TeamList } from '../components/TeamList'
import { CreateTeamDialog } from '../components/CreateTeamDialog'
import { useAuth } from '@/features/auth/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const GET_TEAMS_QUERY = graphql(`
  query GetTeams {
    teams {
      _id
      name
      nfcCardId
      credits
      completedMissionIds
      createdAt
    }
  }
`)

export function TeamsPage() {
  const { user } = useAuth()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const isAdmin = user?.role === 'ADMIN'

  const { data: teams, isLoading, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: () => graphqlClient.request(GET_TEAMS_QUERY),
  })

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <TeamLookup onTeamFound={() => refetch()} />
        <TeamList teams={teams?.teams || []} isLoading={isLoading} />
      </div>

      {isAdmin && (
        <CreateTeamDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false)
            refetch()
          }}
        />
      )}
    </div>
  )
}

