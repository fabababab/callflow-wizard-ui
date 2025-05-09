
import { useState, useEffect } from 'react';

export function useTranscriptTimer(callActive: boolean) {
  const [elapsedTime, setElapsedTime] = useState("00:00");
  
  // Timer for call duration
  useEffect(() => {
    let timer: number | null = null;
    let startTime: number | null = null;
    
    if (callActive) {
      startTime = Date.now();
      timer = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime!) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        setElapsedTime(`${minutes}:${seconds}`);
      }, 1000);
    } else {
      setElapsedTime("00:00");
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [callActive]);
  
  return elapsedTime;
}
