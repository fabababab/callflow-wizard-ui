
import { useState } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useStateMachineLoader } from './useStateMachineLoader';
import { useStateMachineTransitions } from './useStateMachineTransitions';
import { useStateMachineControls } from './useStateMachineControls';
import { useStateMachineJumps } from './useStateMachineJumps';

export function useStateMachine(scenarioType: ScenarioType) {
  // Use the state machine loader
  const {
    stateMachine,
    setStateMachine,
    currentState,
    setCurrentState,
    stateData,
    setStateData,
    isLoading,
    error
  } = useStateMachineLoader(scenarioType);
  
  // Create a state for lastStateChange that can be used by other hooks
  const [lastStateChange, setLastStateChange] = useState<Date | null>(null);
  
  // Use the state machine transitions
  const {
    processingTransition,
    processSelection,
    processStartCall
  } = useStateMachineTransitions(
    stateMachine, 
    currentState, 
    setCurrentState, 
    setStateData
  );
  
  // Use the state machine controls
  const {
    resetStateMachine
  } = useStateMachineControls(
    stateMachine, 
    setCurrentState, 
    setStateData, 
    setLastStateChange
  );
  
  // Use state machine jumps
  useStateMachineJumps(
    stateMachine, 
    setCurrentState, 
    setStateData, 
    setLastStateChange
  );

  return {
    stateMachine,
    currentState,
    stateData,
    isLoading,
    error,
    processSelection,
    processStartCall,
    resetStateMachine,
    lastStateChange,
    processingTransition
  };
}
