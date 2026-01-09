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
  Heart,
  Sparkles,
  Cat,
  Dog,
  Bug,
  Fish,
  Gamepad2,
  Pizza,
  IceCreamCone,
  Music,
  Wand2,
  Trophy,
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
  { id: 'Heart', label: 'Heart', Icon: Heart },
  { id: 'Sparkles', label: 'Sparkles', Icon: Sparkles },
  { id: 'Cat', label: 'Cat', Icon: Cat },
  { id: 'Dog', label: 'Dog', Icon: Dog },
  { id: 'Bug', label: 'Bug', Icon: Bug },
  { id: 'Fish', label: 'Fish', Icon: Fish },
  { id: 'Gamepad2', label: 'Gamepad', Icon: Gamepad2 },
  { id: 'Pizza', label: 'Pizza', Icon: Pizza },
  { id: 'IceCreamCone', label: 'Ice Cream', Icon: IceCreamCone },
  { id: 'Music', label: 'Music', Icon: Music },
  { id: 'Wand2', label: 'Magic Wand', Icon: Wand2 },
  { id: 'Trophy', label: 'Trophy', Icon: Trophy },
] as const;

export type BannerIconId = (typeof BANNER_ICON_OPTIONS)[number]['id'];

export function getBannerIconById(id: string | null | undefined) {
  return BANNER_ICON_OPTIONS.find((o) => o.id === id)?.Icon;
}

