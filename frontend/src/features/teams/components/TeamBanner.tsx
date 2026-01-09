import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

interface TeamBannerProps {
  color: string;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TeamBanner({
  color,
  icon: Icon,
  className,
  size = 'md',
}: TeamBannerProps) {
  const dims =
    size === 'sm'
      ? 'w-[92px] h-[124px]'
      : size === 'lg'
        ? 'w-[160px] h-[220px]'
        : 'w-[128px] h-[176px]';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md shadow-sm border border-border',
        dims,
        className,
      )}
      style={{
        backgroundColor: color,
        // Rectangle with a tapered point at the bottom.
        clipPath: 'polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%)',
      }}
    >
      {/* Subtle highlight */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 45%)',
        }}
      />

      {/* Icon plate */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/75 backdrop-blur-sm rounded-full p-3 border border-border shadow">
          {Icon ? <Icon className="w-8 h-8 text-foreground" /> : null}
        </div>
      </div>

      {/* Bottom notch shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-10 opacity-15 bg-black" />
    </div>
  );
}

