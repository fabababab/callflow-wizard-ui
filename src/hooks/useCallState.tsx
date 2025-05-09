
import { useState, useRef, useCallback } from 'react';

export function useCallState() {
  // Basic call state
  const [isRecording, setIsRecording] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [acceptedCallId, setAcceptedCallId] = useState<string | null>(null);
  
  // Refs for timing
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Toggle recording state
  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording);
  }, [isRecording]);

  // Update timer when call is active
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      setElapsedTime(
        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setElapsedTime('00:00');
  }, []);

  // Set call active state and start timer
  const setCallActiveState = useCallback((active: boolean) => {
    setCallActive(active);
    if (active) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [startTimer, stopTimer]);

  return {
    isRecording,
    callActive,
    elapsedTime,
    acceptedCallId,
    toggleRecording,
    setCallActiveState,
    setAcceptedCallId
  };
}
