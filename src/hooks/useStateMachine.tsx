
import { useEffect, useState, useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { loadStateMachine, getInitialState, getNextState, getStateData, StateMachine, StateMachineState } from '@/utils/stateMachineLoader';

export function useStateMachine(scenarioType: ScenarioType) {
  const [stateMachine, setStateMachine] = useState<StateMachine | null>(null);
  const [currentState, setCurrentState] = useState<string>('');
  const [stateData, setStateData] = useState<StateMachineState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastStateChange, setLastStateChange] = useState<Date | null>(null);
  const [processingTransition, setProcessingTransition] = useState<boolean>(false);
  
  // Load the state machine when scenario changes
  useEffect(() => {
    async function fetchStateMachine() {
      if (!scenarioType) {
        setError("No scenario specified");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Loading state machine for scenario: ${scenarioType}`);
        const machine = await loadStateMachine(scenarioType);
        
        if (!machine) {
          console.error(`Failed to load state machine for scenario: ${scenarioType}`);
          setError(`Failed to load state machine for scenario: ${scenarioType}`);
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
        console.log(`Initial state data:`, initialStateData);
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
  }, [scenarioType]);
  
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
  }, [stateMachine, currentState, processingTransition]);
  
  // Start the call process - shorthand for initiating with a START_CALL event
  const processStartCall = useCallback((): boolean => {
    if (!stateMachine || !currentState) {
      console.warn("Cannot start call: No state machine loaded");
      return false;
    }

    console.log("Processing start call");
    console.log("Current state:", currentState);
    console.log("State data:", stateData);
    console.log("StateMachine has START_CALL transition:", !!stateMachine.states[currentState]?.on?.["START_CALL"]);
    
    // Process the START_CALL transition
    return processSelection("START_CALL");
  }, [stateMachine, currentState, stateData, processSelection]);
  
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
    lastStateChange,
    processingTransition
  };
}
