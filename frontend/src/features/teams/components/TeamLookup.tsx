import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { graphqlClient } from '@/lib/graphql/client'
import { graphql } from '@/lib/graphql/generated'
import { useNFCReader } from '@/hooks/useNFCReader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Search, Radio } from 'lucide-react'
import { toast } from 'sonner'
import { TeamDetails } from './TeamDetails'

const GET_TEAM_QUERY = graphql(`
  query GetTeam($nfcCardId: String!) {
    team(nfcCardId: $nfcCardId) {
      _id
      name
      nfcCardId
      credits
      completedMissionIds
      createdAt
    }
  }
`)

interface TeamLookupProps {
  onTeamFound?: () => void
}

export function TeamLookup({ onTeamFound }: TeamLookupProps) {
  const [nfcCardId, setNfcCardId] = useState('')
  const { isSupported, isReading, readNFC, checkSupport } = useNFCReader()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['team', nfcCardId],
    queryFn: () => graphqlClient.request(GET_TEAM_QUERY, { nfcCardId }),
    enabled: false, // Only run when manually triggered
  })

  const handleNFCRead = async () => {
    if (!isSupported) {
      checkSupport()
      if (!isSupported) {
        toast.error('NFC is not supported on this device')
        return
      }
    }

    const result = await readNFC()
    if (result.success && result.nfcId) {
      setNfcCardId(result.nfcId)
      refetch().then(() => {
        toast.success('Team found!')
        onTeamFound?.()
      })
    } else {
      toast.error(result.error || 'Failed to read NFC card')
    }
  }

  const handleManualSearch = () => {
    if (!nfcCardId.trim()) {
      toast.error('Please enter an NFC card ID')
      return
    }
    refetch().then(() => {
      if (data?.team) {
        toast.success('Team found!')
        onTeamFound?.()
      } else {
        toast.error('Team not found')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lookup Team</CardTitle>
        <CardDescription>Search for a team by NFC card ID</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="nfc-card-id">NFC Card ID</Label>
            <Input
              id="nfc-card-id"
              placeholder="Enter NFC card ID or scan"
              value={nfcCardId}
              onChange={(e) => setNfcCardId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleManualSearch()
                }
              }}
            />
          </div>
          {isSupported && (
            <div className="flex items-end">
              <Button
                onClick={handleNFCRead}
                disabled={isReading}
                variant="outline"
              >
                <Radio className="w-4 h-4 mr-2" />
                {isReading ? 'Reading...' : 'Scan NFC'}
              </Button>
            </div>
          )}
          <div className="flex items-end">
            <Button onClick={handleManualSearch} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {data?.team && <TeamDetails team={data.team} />}
      </CardContent>
    </Card>
  )
}

