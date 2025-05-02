
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScenarioType } from '@/components/ScenarioSelector';
import { 
  loadStateMachine, 
  getInitialState, 
  getNextState, 
  getStateData, 
  StateMachine, 
  StateMachineState
} from '@/utils/stateMachineLoader';

export function useStateMachine(activeScenario: ScenarioType) {
  const [currentState, setCurrentState] = useState<string>('start');
  const [stateMachine, setStateMachine] = useState<StateMachine | null>(null);
  const [stateData, setStateData] = useState<StateMachineState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [lastStateChange, setLastStateChange] = useState<{from: string, to: string} | null>(null);
  const { toast } = useToast();

  // Load state machine when scenario changes
  useEffect(() => {
    async function loadMachine() {
      if (!activeScenario) {
        setStateMachine(null);
        setCurrentState('start');
        setStateData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(`Loading state machine for scenario: ${activeScenario}`);
        const machine = await loadStateMachine(activeScenario);
        setStateMachine(machine);
        
        if (machine) {
          const initialState = getInitialState(machine);
          console.log(`Initial state for ${activeScenario}: ${initialState}`);
          setCurrentState(initialState);
          
          // Set the initial state data
          const initialStateData = getStateData(machine, initialState);
          setStateData(initialStateData);
          
          // Set an initial state change to trigger UI update
          setLastStateChange({
            from: 'initial',
            to: initialState
          });
          
          console.log(`Loaded state machine for scenario: ${activeScenario}`, machine);
        } else {
          console.log(`No state machine found for scenario: ${activeScenario}`);
          setError(`Failed to load state machine for ${activeScenario}`);
        }
      } catch (err) {
        console.error(`Error loading state machine:`, err);
        setError(`Error loading state machine: ${err}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadMachine();
  }, [activeScenario]);

  // Update state data whenever current state changes
  useEffect(() => {
    if (stateMachine && currentState) {
      console.log(`Updating state data for state: ${currentState}`);
      const data = getStateData(stateMachine, currentState);
      
      // Check if this state requires verification
      if (data && data.requiresVerification) {
        setVerificationRequired(true);
        toast({
          title: "Verification Required",
          description: "This action requires additional verification of customer identity",
          variant: "destructive",
        });
      } else {
        setVerificationRequired(false);
      }
      
      setStateData(data);
      
      // Log state data for debugging
      console.log(`State data for ${currentState}:`, data);
    }
  }, [currentState, stateMachine, toast]);

  // Listen for verification completed events
  useEffect(() => {
    const handleVerificationCompleted = () => {
      setVerificationRequired(false);
      toast({
        title: "Verification Completed",
        description: "Customer identity has been verified",
      });
    };
    
    window.addEventListener('verification-completed', handleVerificationCompleted);
    
    return () => {
      window.removeEventListener('verification-completed', handleVerificationCompleted);
    };
  }, [toast]);

  // Transition to a new state
  const transitionToState = useCallback((newState: string) => {
    if (!stateMachine || !stateMachine.states[newState]) {
      console.error(`Cannot transition to invalid state: ${newState}`);
      return false;
    }

    // Check if verification is required before state transition
    if (verificationRequired) {
      toast({
        title: "Verification Required",
        description: "Please complete verification before proceeding",
        variant: "destructive",
      });
      return false;
    }

    // Store the state change information for UI display
    setLastStateChange({
      from: currentState,
      to: newState
    });

    // Log the state transition
    console.log(`Transitioning from ${currentState} to ${newState}`);

    setCurrentState(newState);
    return true;
  }, [currentState, stateMachine, toast, verificationRequired]);

  // Process option selection
  const processSelection = useCallback((selectedOption: string): boolean => {
    if (!stateMachine || !currentState) {
      console.log('Cannot process selection: No state machine or current state');
      return false;
    }

    console.log(`Processing selection: "${selectedOption}" from state: ${currentState}`);
    const nextState = getNextState(stateMachine, currentState, selectedOption);
    
    if (!nextState) {
      // Try DEFAULT transition if no matching option is found
      console.log(`No transition found for option: "${selectedOption}", trying DEFAULT`);
      const defaultNextState = getNextState(stateMachine, currentState, 'DEFAULT');
      
      if (!defaultNextState) {
        console.log('No DEFAULT transition found either');
        return false;
      }
      
      console.log(`Found DEFAULT transition to: ${defaultNextState}`);
      return transitionToState(defaultNextState);
    }

    console.log(`Found next state: ${nextState} for option: "${selectedOption}"`);
    return transitionToState(nextState);
  }, [stateMachine, currentState, transitionToState]);

  // Process default transition
  const processDefaultTransition = useCallback((): boolean => {
    if (!stateMachine || !currentState) {
      return false;
    }

    const nextState = getNextState(stateMachine, currentState, 'DEFAULT');
    
    if (!nextState) {
      // No valid transition found
      console.log(`No default transition found from state: ${currentState}`);
      return false;
    }

    return transitionToState(nextState);
  }, [stateMachine, currentState, transitionToState]);

  // Process START_CALL event to move from start to first active state
  const processStartCall = useCallback((): boolean => {
    console.log('processStartCall called');
    
    if (!stateMachine) {
      console.error('Cannot process START_CALL: No state machine loaded');
      return false;
    }
    
    console.log(`Processing START_CALL event from state: ${currentState}`);
    
    // Try to find a START_CALL transition
    const nextState = getNextState(stateMachine, currentState, 'START_CALL');
    
    if (nextState) {
      console.log(`Found START_CALL transition to: ${nextState}`);
      return transitionToState(nextState);
    }
    
    // If no START_CALL transition, try default
    console.log('No START_CALL transition found, trying default transition');
    return processDefaultTransition();
  }, [stateMachine, currentState, transitionToState, processDefaultTransition]);

  // Reset the state machine to initial state
  const resetStateMachine = useCallback(() => {
    if (stateMachine) {
      const initialState = getInitialState(stateMachine);
      console.log(`Resetting state machine to initial state: ${initialState}`);
      setCurrentState(initialState);
      setStateData(getStateData(stateMachine, initialState));
      setVerificationRequired(false);
      
      // Set a state change to trigger UI update
      setLastStateChange({
        from: currentState,
        to: initialState
      });
      
      toast({
        title: "Scenario Reset",
        description: "Test scenario has been reset to the beginning",
      });
      
      return true;
    }
    return false;
  }, [stateMachine, currentState, toast]);

  // Manually set current state (useful for testing)
  const setCurrentStateManually = useCallback((newState: string) => {
    if (stateMachine && stateMachine.states[newState]) {
      console.log(`Manually setting state to: ${newState} from: ${currentState}`);
      
      // Store the state change information for UI display
      setLastStateChange({
        from: currentState,
        to: newState
      });
      
      setCurrentState(newState);
      return true;
    }
    return false;
  }, [stateMachine, currentState]);

  // Check if current state is a final state (ending the conversation)
  const isFinalState = useCallback(() => {
    if (!stateMachine || !currentState) {
      return false;
    }
    
    // Consider a state final if it doesn't have any transitions defined
    const state = stateMachine.states[currentState];
    return state && (!state.on || Object.keys(state.on).length === 0);
  }, [stateMachine, currentState]);

  return {
    currentState,
    stateData,
    stateMachine,
    isLoading,
    error,
    verificationRequired,
    lastStateChange,
    transitionToState,
    processSelection,
    processDefaultTransition,
    processStartCall,
    resetStateMachine,
    isFinalState,
    setCurrentState: setCurrentStateManually
  };
}
