
import { useState, useRef, useCallback, useEffect } from 'react';

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
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setElapsedTime('00:00');
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callActive]);

  // Method to start a call
  const startCall = useCallback(() => {
    setCallActive(true);
  }, []);
  
  // Method to end a call
  const endCall = useCallback(() => {
    setCallActive(false);
    setAcceptedCallId(null);
  }, []);
  
  // Accept an incoming call
  const acceptCall = useCallback((callId: string) => {
    setAcceptedCallId(callId);
    setCallActive(true);
  }, []);
  
  // Toggle call state
  const handleCall = useCallback(() => {
    console.log('handleCall called, current callActive:', callActive);
    if (callActive) {
      endCall();
    } else {
      startCall();
    }
  }, [callActive, endCall, startCall]);
  
  // Reset timer without ending call
  const resetTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsedTime('00:00');
  }, []);

  return {
    isRecording,
    callActive,
    elapsedTime,
    acceptedCallId,
    toggleRecording,
    setCallActive, // Direct setter
    setAcceptedCallId,
    startCall,
    endCall,
    acceptCall,
    handleCall,
    resetTimer
  };
}

export default useCallState;
