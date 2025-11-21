import { useState, useEffect } from 'react'
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

  // Check NFC support on mount
  useEffect(() => {
    checkSupport()
  }, [checkSupport])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['team', nfcCardId],
    queryFn: () => graphqlClient.request(GET_TEAM_QUERY, { nfcCardId }),
    enabled: false, // Only run when manually triggered
  })

  // Show toast when team is found or not found after refetch
  useEffect(() => {
    if (nfcCardId && data !== undefined && !isLoading) {
      if (data?.team) {
        toast.success('Team found!')
        onTeamFound?.()
      } else if (nfcCardId.trim()) {
        // Only show error if we actually searched (not initial load)
        toast.error('Team not found for this NFC card')
      }
    }
  }, [data, nfcCardId, isLoading, onTeamFound])

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
      // Set the NFC ID in the input field
      setNfcCardId(result.nfcId)
      toast.success(`NFC card scanned: ${result.nfcId}`)
      
      // Automatically search for the team
      refetch().then(() => {
        // Check if team was found (need to wait for query to complete)
        setTimeout(() => {
          // The query result will be in data after refetch completes
          // We'll check it in the effect or show appropriate message
        }, 100)
      })
    } else {
      const errorMsg = result.error || 'Failed to read NFC card'
      console.error('NFC read error:', errorMsg, result)
      toast.error(errorMsg)
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

