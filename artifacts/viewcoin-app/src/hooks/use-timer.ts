import { useState, useEffect, useRef } from 'react';

export function useTimer(isActive: boolean, onTickComplete: () => void) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const onCompleteRef = useRef(onTickComplete);
  
  // Keep ref up to date
  useEffect(() => {
    onCompleteRef.current = onTickComplete;
  }, [onTickComplete]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => {
          const next = prev + 1;
          // Every 5 minutes (300 seconds)
          if (next >= 300) {
            onCompleteRef.current();
            return 0; // reset for next cycle
          }
          return next;
        });
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }

    return () => clearInterval(interval);
  }, [isActive]);

  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  
  // Time remaining to next coin
  const remainingSeconds = 300 - secondsElapsed;
  const remMin = Math.floor(remainingSeconds / 60);
  const remSec = remainingSeconds % 60;

  const formattedRemaining = `${remMin.toString().padStart(2, '0')}:${remSec.toString().padStart(2, '0')}`;
  
  const progress = (secondsElapsed / 300) * 100;

  return { secondsElapsed, formattedRemaining, progress };
}
