
import { useEffect, useState, useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { loadStateMachine, getInitialState, getNextState, getStateData, StateMachine, StateMachineState } from '@/utils/stateMachineLoader';

export function useStateMachine(scenario: ScenarioType) {
  const [stateMachine, setStateMachine] = useState<StateMachine | null>(null);
  const [currentState, setCurrentState] = useState<string>('');
  const [stateData, setStateData] = useState<StateMachineState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastStateChange, setLastStateChange] = useState<Date | null>(null);
  
  // Load the state machine when scenario changes
  useEffect(() => {
    async function fetchStateMachine() {
      if (!scenario) {
        setError("No scenario specified");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Loading state machine for scenario: ${scenario}`);
        const machine = await loadStateMachine(scenario);
        
        if (!machine) {
          console.error(`Failed to load state machine for scenario: ${scenario}`);
          setError(`Failed to load state machine for scenario: ${scenario}`);
          setIsLoading(false);
          return;
        }
        
        console.log(`Successfully loaded state machine:`, machine);
        
        // Store the machine
        setStateMachine(machine);
        
        // Get initial state
        const initialState = getInitialState(machine);
        console.log(`Initial state: ${initialState}`);
        
        // Set current state to initial
        setCurrentState(initialState);
        
        // Get data for initial state
        const initialStateData = getStateData(machine, initialState);
        setStateData(initialStateData);
        
        // Set loading false
        setIsLoading(false);
        
      } catch (err) {
        console.error("Error in useStateMachine:", err);
        setError(`Failed to load state machine: ${err}`);
        setIsLoading(false);
      }
    }
    
    fetchStateMachine();
  }, [scenario]);
  
  // Process user selection to update state
  const processSelection = useCallback((selection: string): boolean => {
    if (!stateMachine || !currentState) {
      console.warn("Cannot process selection: No state machine loaded or no current state");
      return false;
    }
    
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
    setStateData(nextStateData);
    
    // Update last state change timestamp
    setLastStateChange(new Date());
    
    return true;
  }, [stateMachine, currentState]);
  
  // Start the call process - shorthand for initiating with a START_CALL event
  const processStartCall = useCallback((): boolean => {
    if (!stateMachine || !currentState) {
      console.warn("Cannot start call: No state machine loaded");
      return false;
    }

    console.log("Processing start call");
    
    // Process the START_CALL transition
    return processSelection("START_CALL");
  }, [stateMachine, currentState, processSelection]);
  
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
  }, [stateMachine]);
  
  return {
    stateMachine,
    currentState,
    stateData,
    isLoading,
    error,
    processSelection,
    processStartCall,
    resetStateMachine,
    lastStateChange
  };
}
