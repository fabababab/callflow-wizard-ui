
import { useState, useEffect } from 'react';

interface StateChangeEffectProps {
  stateData: any;
  lastStateChange: string | null;
  callActive: boolean;
  currentState: string;
  processStateChange: () => void;
  debounceTimerRef: React.MutableRefObject<number | null>;
}

export function useStateChangeEffect({
  stateData,
  lastStateChange,
  callActive,
  currentState,
  processStateChange,
  debounceTimerRef
}: StateChangeEffectProps) {
  const [debugLastStateChange, setDebugLastStateChange] = useState<string>("");
  
  // Update to properly update UI when state changes
  useEffect(() => {
    if (!stateData || !callActive || !lastStateChange) {
      return;
    }
    
    // For debugging purposes, track state changes
    setDebugLastStateChange(new Date().toISOString());
    console.log(`State change detected: ${currentState} at ${new Date().toISOString()}`);
    
    processStateChange();
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    stateData, 
    lastStateChange, 
    callActive, 
    processStateChange,
    debounceTimerRef,
    currentState
  ]);

  return { debugLastStateChange };
}
