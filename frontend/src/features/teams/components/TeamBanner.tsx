import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface TeamBannerProps {
  color: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TeamBanner({
  color,
  icon: Icon,
  className,
  size = 'md',
}: TeamBannerProps) {
  // Use a fixed aspect ratio so the banner can scale cleanly just by changing width.
  // (Callers can also override width/height via className.)
  const widthClass =
    size === 'sm' ? 'w-[92px]' : size === 'lg' ? 'w-[160px]' : 'w-[128px]';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md shadow-sm border border-border aspect-[92/124]',
        widthClass,
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

      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Icon ? (
          <Icon
            className="text-foreground drop-shadow-sm"
            style={{ width: '45%', height: '45%' }}
          />
        ) : null}
      </div>

      {/* Bottom notch shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-[18%] opacity-15 bg-black" />
    </div>
  );
}
