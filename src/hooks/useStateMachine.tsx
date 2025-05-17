
import { useState, useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { StateMachine, StateMachineState } from '@/utils/stateMachineLoader';
import { useStateMachineLoader } from '@/hooks/useStateMachineLoader';
import { useStateTransition } from '@/hooks/useStateTransition';
import { useStateMachineCall } from '@/hooks/useStateMachineCall';
import { useStateJump } from '@/hooks/useStateJump';

export function useStateMachine(scenarioType: ScenarioType) {
  const [lastStateChange, setLastStateChange] = useState<Date | null>(null);
  
  // Use the state machine loader
  const {
    stateMachine,
    currentState,
    setCurrentState,
    stateData,
    setStateData,
    isLoading,
    error
  } = useStateMachineLoader(scenarioType);
  
  // Use the state transition hook
  const {
    processingTransition,
    processSelection
  } = useStateTransition(
    stateMachine, 
    currentState, 
    setCurrentState, 
    setStateData
  );
  
  // Use the state machine call hook
  const {
    processStartCall,
    resetStateMachine
  } = useStateMachineCall(
    stateMachine, 
    processSelection, 
    setCurrentState, 
    setStateData, 
    setLastStateChange
  );
  
  // Use the state jump hook
  useStateJump(
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
