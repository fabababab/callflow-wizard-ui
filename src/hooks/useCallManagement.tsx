
import { useState, useCallback, useRef, useEffect } from 'react';

export const useCallManagement = () => {
  const [callActive, setCallActive] = useState(false);
  const [acceptedCallId, setAcceptedCallId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Update timer when call is active
  useEffect(() => {
    if (callActive) {
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setElapsedTime(
          `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callActive]);
  
  const startCall = useCallback(() => {
    setCallActive(true);
  }, []);
  
  const endCall = useCallback(() => {
    setCallActive(false);
    setAcceptedCallId(null);
  }, []);
  
  const acceptCall = useCallback((callId: string) => {
    setAcceptedCallId(callId);
    setCallActive(true);
  }, []);
  
  const handleCall = useCallback(() => {
    if (callActive) {
      endCall();
    } else {
      startCall();
    }
  }, [callActive, endCall, startCall]);
  
  // Reset the timer without ending the call
  const resetTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsedTime('00:00');
  }, []);
  
  return {
    callActive,
    elapsedTime,
    acceptedCallId,
    startCall,
    endCall,
    acceptCall,
    handleCall,
    resetTimer
  };
};

export default useCallManagement;
