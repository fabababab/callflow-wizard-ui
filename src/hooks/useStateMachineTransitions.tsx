
import { useState, useCallback } from 'react';
import { getNextState, getStateData, StateMachine } from '@/utils/stateMachineLoader';

export function useStateMachineTransitions(
  stateMachine: StateMachine | null,
  currentState: string,
  setCurrentState: (state: string) => void,
  setStateData: (data: any) => void
) {
  const [lastStateChange, setLastStateChange] = useState<Date | null>(null);
  const [processingTransition, setProcessingTransition] = useState<boolean>(false);
  
  // Process user selection to update state
  const processSelection = useCallback((selection: string): boolean => {
    if (!stateMachine || !currentState) {
      console.warn("Cannot process selection: No state machine loaded or no current state");
      return false;
    }
    
    // Prevent concurrent transitions
    if (processingTransition) {
      console.warn(`Ignoring selection "${selection}" - another transition is already in progress`);
      return false;
    }
    
    setProcessingTransition(true);
    
    try {
      console.log(`Processing selection: "${selection}" from state: ${currentState}`);
      
      // Get next state based on selection
      const nextState = getNextState(stateMachine, currentState, selection);
      
      if (!nextState) {
        console.warn(`No transition found for selection: "${selection}" from state: ${currentState}`);
        // Try DEFAULT transition as fallback
        const defaultTransition = getNextState(stateMachine, currentState, "DEFAULT");
        
        if (defaultTransition) {
          console.log(`Using DEFAULT transition to state: ${defaultTransition}`);
          
          // Update current state
          setCurrentState(defaultTransition);
          
          // Get data for new state
          const nextStateData = getStateData(stateMachine, defaultTransition);
          console.log(`Next state data (from DEFAULT):`, nextStateData);
          setStateData(nextStateData);
          
          // Update last state change timestamp
          setLastStateChange(new Date());
          
          return true;
        }
        
        return false;
      }
      
      console.log(`Transitioning to state: ${nextState}`);
      
      // Update current state
      setCurrentState(nextState);
      
      // Get data for new state
      const nextStateData = getStateData(stateMachine, nextState);
      console.log(`Next state data:`, nextStateData);
      setStateData(nextStateData);
      
      // Update last state change timestamp
      setLastStateChange(new Date());
      
      return true;
    } finally {
      // Reset processing flag
      setProcessingTransition(false);
    }
  }, [stateMachine, currentState, processingTransition, setCurrentState, setStateData]);
  
  // Start the call process - shorthand for initiating with a START_CALL event
  const processStartCall = useCallback((): boolean => {
    if (!stateMachine || !currentState) {
      console.warn("Cannot start call: No state machine loaded");
      return false;
    }

    console.log("Processing start call");
    console.log("Current state:", currentState);
    console.log("StateMachine has START_CALL transition:", stateMachine.states[currentState]?.on?.["START_CALL"]);
    
    // Process the START_CALL transition
    return processSelection("START_CALL");
  }, [stateMachine, currentState, processSelection]);

  return {
    lastStateChange,
    processingTransition,
    processSelection,
    processStartCall
  };
}
