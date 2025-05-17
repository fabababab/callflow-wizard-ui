
import { useCallback } from 'react';
import { getInitialState, getStateData, StateMachine } from '@/utils/stateMachineLoader';

export function useStateMachineCall(
  stateMachine: StateMachine | null,
  processSelection: (selection: string) => boolean,
  setCurrentState: (state: string) => void,
  setStateData: (data: any) => void,
  setLastStateChange: (date: Date) => void
) {
  // Start the call process - shorthand for initiating with a START_CALL event
  const processStartCall = useCallback((): boolean => {
    if (!stateMachine) {
      console.warn("Cannot start call: No state machine loaded");
      return false;
    }

    console.log("Processing start call");
    
    // Process the START_CALL transition
    return processSelection("START_CALL");
  }, [stateMachine, processSelection]);
  
  // Reset the state machine to initial state
  const resetStateMachine = useCallback(() => {
    if (!stateMachine) {
      return;
    }
    
    const initialState = getInitialState(stateMachine);
    setCurrentState(initialState);
    
    const initialStateData = getStateData(stateMachine, initialState);
    setStateData(initialStateData);
    
    setLastStateChange(new Date());
    
    console.log(`State machine reset to initial state: ${initialState}`);
  }, [stateMachine, setCurrentState, setStateData, setLastStateChange]);
  
  return {
    processStartCall,
    resetStateMachine
  };
}
