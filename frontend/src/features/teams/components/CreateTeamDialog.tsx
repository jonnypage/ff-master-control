import { useState } from 'react'
import { useNFCReader } from '@/hooks/useNFCReader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Radio } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateTeam } from '@/lib/api/useApi'

interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTeamDialogProps) {
  const [name, setName] = useState('')
  const [nfcCardId, setNfcCardId] = useState('')
  const { isSupported, isReading, readNFC, checkSupport } = useNFCReader()

  const createTeam = useCreateTeam()

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
      toast.success('NFC card scanned successfully!')
    } else {
      toast.error(result.error || 'Failed to read NFC card')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !nfcCardId.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    createTeam.mutate(
      { input: { name: name.trim(), nfcCardId: nfcCardId.trim() } },
      {
        onSuccess: () => {
          toast.success('Team created successfully!')
          setName('')
          setNfcCardId('')
          onSuccess()
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message || 'Failed to create team'
          toast.error(message)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a new team with an NFC card ID
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter team name"
                required
              />
            </div>
            <div>
              <Label htmlFor="nfc-id">NFC Card ID</Label>
              <div className="flex gap-2">
                <Input
                  id="nfc-id"
                  value={nfcCardId}
                  onChange={(e) => setNfcCardId(e.target.value)}
                  placeholder="Enter NFC card ID or scan"
                  required
                  className="flex-1"
                />
                {isSupported && (
                  <Button
                    type="button"
                    onClick={handleNFCRead}
                    disabled={isReading}
                    variant="outline"
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    {isReading ? 'Scanning...' : 'Scan'}
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTeam.isPending}>
              {createTeam.isPending ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

