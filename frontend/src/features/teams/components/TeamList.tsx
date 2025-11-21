import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { GetTeamsQuery } from '@/lib/graphql/generated'

interface TeamListProps {
  teams: GetTeamsQuery['teams']
  isLoading: boolean
}

export function TeamList({ teams, isLoading }: TeamListProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading teams...</div>
  }

  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No teams found. Create a team to get started.
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All Teams</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team: GetTeamsQuery['teams'][number]) => (
          <Card key={team._id}>
            <CardHeader>
              <CardTitle className="text-lg">{team.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Credits:</span>
                <Badge variant="secondary">{team.credits}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Missions:</span>
                <Badge>{team.completedMissionIds.length}</Badge>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Card ID: <code className="bg-gray-100 px-1 rounded">{team.nfcCardId}</code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

