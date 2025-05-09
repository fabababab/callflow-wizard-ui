
import { useCallback } from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';
import { useToast } from '@/hooks/use-toast';

export function useTransitionExtractor(stateMachine: StateMachine | null) {
  const { toast } = useToast();
  
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
      } else {
        console.log(`No valid transitions found for state ${state}, checking for nextState`);
      }
    }
    
    // If we have no transitions or only special ones, check for nextState as fallback
    if (options.length === 0 && currentStateData.nextState) {
      options.push("Continue");
      console.log(`Using "Continue" as fallback for state ${state} with nextState`);
    }
    
    // If we still have no options, add a default one
    if (options.length === 0) {
      options.push("Acknowledge");
      console.log(`Using "Acknowledge" as last resort for state ${state}`);
    }
    
    return options;
  }, [stateMachine]);

  // Function to get detailed JSON representation of a state
  const getStateJson = useCallback((state: string): string => {
    if (!stateMachine || !stateMachine.states[state]) {
      return JSON.stringify({ error: "State not found" }, null, 2);
    }
    
    // Create enhanced JSON with current state highlighted
    const enhancedStateMachine = {
      ...stateMachine,
      _currentState: state,
      _availableTransitions: stateMachine.states[state]?.on || {},
      _responseOptions: extractTransitionsAsResponseOptions(state)
    };
    
    return JSON.stringify(enhancedStateMachine, null, 2);
  }, [stateMachine, extractTransitionsAsResponseOptions]);

  // Debug state transitions - useful for testing
  const logStateTransitions = useCallback((currentState: string) => {
    if (!stateMachine || !stateMachine.states[currentState]) {
      console.warn(`Cannot log transitions: Invalid state ${currentState}`);
      return;
    }
    
    console.log(`=== State: ${currentState} ===`);
    console.log(`Response options: ${extractTransitionsAsResponseOptions(currentState).join(', ')}`);
    
    // Log all possible transitions
    if (stateMachine.states[currentState].on) {
      console.log('Available transitions:');
      Object.entries(stateMachine.states[currentState].on!).forEach(([transition, nextState]) => {
        console.log(`  "${transition}" -> "${nextState}"`);
      });
    } else {
      console.log('No transitions defined for this state');
    }
    
    // Log if there's a nextState property
    if (stateMachine.states[currentState].nextState) {
      console.log(`nextState: ${stateMachine.states[currentState].nextState}`);
    }
  }, [stateMachine, extractTransitionsAsResponseOptions]);

  return { 
    extractTransitionsAsResponseOptions,
    getStateJson,
    logStateTransitions
  };
}
