import { useEffect, useState } from 'react';

/** Time until midnight Pakistan Standard Time (UTC+5). */
export function getTimeUntilMidnightPKT() {
  const now = new Date();
  const pktOffsetMinutes = 5 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const pktMinutes = (utcMinutes + pktOffsetMinutes) % (24 * 60);
  const minutesUntilMidnight = 24 * 60 - pktMinutes;

  const hours = Math.floor(minutesUntilMidnight / 60);
  const minutes = minutesUntilMidnight % 60;

  return { hours, minutes, total: minutesUntilMidnight };
}

export function formatMidnightCountdown({ hours, minutes }) {
  if (hours <= 0 && minutes <= 0) return 'soon';
  return `${hours}h ${minutes}m`;
}

export function useMidnightCountdown() {
  const [timeLeft, setTimeLeft] = useState(() => getTimeUntilMidnightPKT());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilMidnightPKT());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}
