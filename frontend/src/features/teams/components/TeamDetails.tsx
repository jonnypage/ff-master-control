import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { GetTeamQuery } from '@/lib/graphql/generated'

interface TeamDetailsProps {
  team: GetTeamQuery['team']
}

export function TeamDetails({ team }: TeamDetailsProps) {
  if (!team) return null

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">NFC Card ID:</span>
          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {team.nfcCardId}
          </code>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Credits:</span>
          <Badge variant="secondary" className="text-lg font-semibold">
            {team.credits}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Missions Completed:</span>
          <Badge>{team.completedMissionIds.length}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

