import {
  Shield,
  Swords,
  Flame,
  Star,
  Crown,
  Skull,
  Zap,
  Target,
  Rocket,
  HandMetal,
  Ghost,
  Gem,
} from 'lucide-react';

export const BANNER_ICON_OPTIONS = [
  { id: 'Shield', label: 'Shield', Icon: Shield },
  { id: 'Swords', label: 'Swords', Icon: Swords },
  { id: 'Flame', label: 'Flame', Icon: Flame },
  { id: 'Star', label: 'Star', Icon: Star },
  { id: 'Crown', label: 'Crown', Icon: Crown },
  { id: 'Skull', label: 'Skull', Icon: Skull },
  { id: 'Zap', label: 'Zap', Icon: Zap },
  { id: 'Target', label: 'Target', Icon: Target },
  { id: 'Rocket', label: 'Rocket', Icon: Rocket },
  { id: 'HandMetal', label: 'Rock', Icon: HandMetal },
  { id: 'Ghost', label: 'Ghost', Icon: Ghost },
  { id: 'Gem', label: 'Gem', Icon: Gem },
] as const;

export type BannerIconId = (typeof BANNER_ICON_OPTIONS)[number]['id'];

export function getBannerIconById(id: string | null | undefined) {
  return BANNER_ICON_OPTIONS.find((o) => o.id === id)?.Icon;
}

