
import { useEffect, useState, MutableRefObject } from 'react';
import { StateMachineState } from '@/utils/stateMachineLoader';

interface StateChangeEffectProps {
  stateData: StateMachineState | null;
  lastStateChange: Date | null;
  callActive: boolean;
  currentState: string;
  processStateChange: () => void; // This should be a function with no parameters
  debounceTimerRef: MutableRefObject<number | null>;
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

  // Effect to track the last state change for debugging
  useEffect(() => {
    if (lastStateChange) {
      setDebugLastStateChange(`State changed to ${currentState} at ${lastStateChange.toISOString()}`);
    }
  }, [lastStateChange, currentState]);

  // Effect that processes state changes
  useEffect(() => {
    console.log("State change effect triggered. Current state:", currentState);
    console.log("Call active:", callActive);
    console.log("State data exists:", !!stateData);
    
    if (callActive && currentState && stateData) {
      // Process state change
      console.log(`Processing state change for state: ${currentState}`);
      
      // Check if the state requires verification
      const requiresVerification = stateData.requiresVerification === true;
      if (requiresVerification) {
        console.log(`State ${currentState} requires verification before proceeding`);
      }
      
      processStateChange(); // Call the function as passed
    }
    
    return () => {
      // Clear any pending timers when unmounting or when dependencies change
      if (debounceTimerRef.current) {
        console.log("Clearing debounce timer on cleanup");
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [callActive, currentState, stateData, processStateChange, debounceTimerRef]);

  // Also trigger state change when lastStateChange updates (e.g., after a transition)
  useEffect(() => {
    if (lastStateChange && callActive && currentState && stateData) {
      console.log(`State change detected at ${lastStateChange.toISOString()}`);
      processStateChange(); // Call the function as passed
    }
  }, [lastStateChange, callActive, currentState, stateData, processStateChange]);

  return { debugLastStateChange };
}
