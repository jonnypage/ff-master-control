import { useState, useEffect, useRef } from 'react';

interface MissionTimerProps {
  startedAt: string;
  duration: number;
  onExpire?: () => void;
  className?: string;
}

export function MissionTimer({
  startedAt,
  duration,
  onExpire,
  className,
}: MissionTimerProps) {
  // duration is in minutes
  const hasExpired = useRef(false);
  
  const calculateTimeLeft = () => {
    const start = new Date(startedAt).getTime();
    const now = new Date().getTime();
    const end = start + duration * 60 * 1000;
    return end - now;
  };

  const [timeLeft, setTimeLeft] = useState<number>(() => Math.max(0, calculateTimeLeft()));

  // Update effect when props change or on interval
  useEffect(() => {
    // Immediate update on prop change
    const time = calculateTimeLeft();
    setTimeLeft(time);

    // Reset expiry ref if time is positive (e.g. added time)
    if (time > 0) {
      hasExpired.current = false;
    }

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0 && onExpire && !hasExpired.current) {
         hasExpired.current = true;
         onExpire();
         clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, duration, onExpire]);

  const displayTime = Math.max(0, timeLeft);
  const minutes = Math.floor(displayTime / 60000);
  const seconds = Math.floor((displayTime % 60000) / 1000);
  const isOverdue = timeLeft < 0;

  return (
    <span
      className={`${!className?.includes('font-') ? 'font-mono' : ''} ${isOverdue ? 'text-destructive font-bold' : ''} ${className || ''}`}
    >
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}
