import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCreateTeam } from '@/lib/api/useApi';
import { TeamBanner } from './TeamBanner';
import { BANNER_ICON_OPTIONS, type BannerIconId } from './banner-icons';

interface TeamCreateFormProps {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  onCreated?: (teamGuid: string) => void;
}

export function TeamCreateForm({
  submitLabel = 'Create Team',
  cancelLabel = 'Cancel',
  onCancel,
  onCreated,
}: TeamCreateFormProps) {
  const createTeam = useCreateTeam();

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [bannerColor, setBannerColor] = useState('#7c3aed');
  const [bannerIcon, setBannerIcon] = useState<BannerIconId>('Shield');

  const reset = () => {
    setName('');
    setPin('');
    setConfirmPin('');
    setBannerColor('#7c3aed');
    setBannerIcon('Shield');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !pin.trim() || !confirmPin.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    createTeam.mutate(
      { input: { name: name.trim(), pin, bannerColor, bannerIcon } },
      {
        onSuccess: (data) => {
          const teamGuid = data?.createTeam?.teamGuid;
          if (!teamGuid) {
            toast.error('Team created, but no Team GUID was returned');
            return;
          }
          toast.success('Team created!');
          reset();
          onCreated?.(teamGuid);
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message || 'Failed to create team';
          toast.error(errorMessage);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <Label>Banner Preview</Label>
          <div className="mt-2">
            <TeamBanner
              color={bannerColor}
              icon={BANNER_ICON_OPTIONS.find((o) => o.id === bannerIcon)?.Icon}
              size="sm"
            />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="banner-color">Banner Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="banner-color"
                type="color"
                value={bannerColor}
                onChange={(e) => setBannerColor(e.target.value)}
                className="h-11 w-16 p-1"
              />
              <Input
                value={bannerColor}
                onChange={(e) => setBannerColor(e.target.value)}
                placeholder="#7c3aed"
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Banner Icon</Label>
            <div className="grid grid-cols-6 gap-2">
              {BANNER_ICON_OPTIONS.map(({ id, label, Icon }) => {
                const isSelected = bannerIcon === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setBannerIcon(id)}
                    className={`h-10 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30 bg-accent'
                        : 'border-border hover:bg-accent/50'
                    }`}
                    aria-pressed={isSelected}
                    aria-label={label}
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="team-name">Team Name</Label>
        <Input
          id="team-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter team name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pin">4-digit PIN</Label>
        <Input
          id="pin"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="1234"
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-pin">Confirm PIN</Label>
        <Input
          id="confirm-pin"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          placeholder="1234"
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={createTeam.isPending}
          >
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={createTeam.isPending}>
          {createTeam.isPending ? 'Creating...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

