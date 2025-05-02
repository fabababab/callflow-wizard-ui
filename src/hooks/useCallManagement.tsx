
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useCallManagement() {
  const [callActive, setCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [acceptedCallId, setAcceptedCallId] = useState<number | null>(null);
  const { toast } = useToast();

  // Timer for call duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (callActive && callStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - callStartTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [callActive, callStartTime]);

  const startCall = useCallback(() => {
    setCallActive(true);
    setCallStartTime(new Date());
    toast({
      title: "Call Started",
      description: "You've started a new call",
    });
  }, [toast]);

  const endCall = useCallback(() => {
    setCallActive(false);
    setCallStartTime(null);
    setElapsedTime('00:00');
    setAcceptedCallId(null);
    toast({
      title: "Call Ended",
      description: `Call duration: ${elapsedTime}`,
    });
  }, [elapsedTime, toast]);

  const acceptCall = useCallback((callId: number) => {
    setAcceptedCallId(callId);
    setCallActive(true);
    setCallStartTime(new Date());
    toast({
      title: "Call Accepted",
      description: "You have accepted the incoming call",
    });
  }, [toast]);

  const handleCall = useCallback(() => {
    if (!callActive) {
      startCall();
    } else {
      endCall();
    }
  }, [callActive, startCall, endCall]);

  return {
    callActive,
    callStartTime,
    elapsedTime,
    acceptedCallId,
    startCall,
    endCall,
    acceptCall,
    handleCall
  };
}
