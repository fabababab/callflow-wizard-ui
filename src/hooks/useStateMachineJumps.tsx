
import { useEffect } from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';

export function useStateMachineJumps(
  stateMachine: StateMachine | null,
  setCurrentState: (state: string) => void,
  setStateData: (data: any) => void,
  setLastStateChange: (date: Date) => void
) {
  // Add event listener for jump-to-state events
  useEffect(() => {
    const handleJumpToState = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.stateId) {
        const targetState = customEvent.detail.stateId;
        console.log(`Jumping to state: ${targetState}`);
        
        // Only proceed if the state machine and specified state exists
        if (stateMachine && stateMachine.states[targetState]) {
          // Update the current state directly
          setCurrentState(targetState);
          
          // Get the state data for the new state
          const newStateData = stateMachine.states[targetState];
          setStateData(newStateData);
          
          // Trigger state change event (needed to update UI and process the new state)
          const now = new Date();
          setLastStateChange(now);
        }
      }
    };
    
    window.addEventListener('jump-to-state', handleJumpToState);
    
    return () => {
      window.removeEventListener('jump-to-state', handleJumpToState);
    };
  }, [stateMachine, setCurrentState, setStateData, setLastStateChange]);
}
