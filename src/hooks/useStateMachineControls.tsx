
import { useCallback } from 'react';
import { getInitialState, getStateData, StateMachine } from '@/utils/stateMachineLoader';

export function useStateMachineControls(
  stateMachine: StateMachine | null,
  setCurrentState: (state: string) => void,
  setStateData: (data: any) => void,
  setLastStateChange: (date: Date) => void
) {
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
    resetStateMachine
  };
}
