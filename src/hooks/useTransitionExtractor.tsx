
import { useCallback } from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';

export function useTransitionExtractor(stateMachine: StateMachine | null) {
  // Function to extract available transitions from the current state
  const extractTransitionsAsResponseOptions = useCallback((state: string): string[] => {
    if (!stateMachine || !stateMachine.states[state]) {
      console.log(`No state machine or state not found: ${state}`);
      return [];
    }
    
    const currentStateData = stateMachine.states[state];
    const options: string[] = [];
    
    // First check if there are responseOptions explicitly defined
    if (currentStateData.meta?.responseOptions && currentStateData.meta.responseOptions.length > 0) {
      console.log(`Found explicit responseOptions for state ${state}:`, currentStateData.meta.responseOptions);
      return currentStateData.meta.responseOptions;
    }
    
    // If no explicit responseOptions, extract them from the transitions
    if (currentStateData.on) {
      // Get all available transitions except special ones like DEFAULT and START_CALL
      for (const transition in currentStateData.on) {
        if (transition !== 'DEFAULT' && transition !== 'START_CALL') {
          options.push(transition);
        }
      }
      
      if (options.length > 0) {
        console.log(`Extracted transitions for state ${state}:`, options);
      }
    }
    
    // If we have no transitions or only special ones, check for nextState as fallback
    if (options.length === 0 && currentStateData.nextState) {
      options.push("Continue");
    }
    
    return options;
  }, [stateMachine]);

  return { extractTransitionsAsResponseOptions };
}
