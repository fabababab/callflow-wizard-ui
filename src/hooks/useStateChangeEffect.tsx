
import { useEffect, useState } from 'react';
import { StateMachineState } from '@/utils/stateMachineLoader';

interface StateChangeEffectProps {
  stateData: StateMachineState | null;
  lastStateChange: Date | null;
  callActive: boolean;
  currentState: string | null;
  processStateChange: (stateData: StateMachineState | null, currentState: string) => void;
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
  const [debugLastStateChange, setDebugLastStateChange] = useState<string>('');

  // Effect for processing state changes
  useEffect(() => {
    if (
      lastStateChange && 
      callActive && 
      stateData && 
      currentState
    ) {
      console.log(`State change effect triggered. Current state: ${currentState}`);
      console.log(`Call active: ${callActive}`);
      console.log(`State data exists: ${!!stateData}`);

      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }

      // Use a small delay to prevent multiple updates in the same cycle
      debounceTimerRef.current = window.setTimeout(() => {
        console.log(`Processing state change for state: ${currentState}`);
        processStateChange(stateData, currentState);
        
        // Set debug info
        setDebugLastStateChange(`State changed to ${currentState} at ${lastStateChange.toISOString()}`);
      }, 50);
      
      return () => {
        if (debounceTimerRef.current) {
          window.clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
      };
    }
  }, [lastStateChange, callActive, stateData, currentState, processStateChange, debounceTimerRef]);

  // Force state change processing if needed (for debugging)
  const forceProcessStateChange = () => {
    console.log(`Forcing state change processing...`);
    if (stateData && currentState) {
      processStateChange(stateData, currentState);
    }
  };

  return {
    debugLastStateChange,
    forceProcessStateChange
  };
}
