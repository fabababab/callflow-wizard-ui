
import { useState, useEffect } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { loadStateMachine, getInitialState, getStateData, StateMachine, StateMachineState } from '@/utils/stateMachineLoader';

export function useStateMachineLoader(scenarioType: ScenarioType) {
  const [stateMachine, setStateMachine] = useState<StateMachine | null>(null);
  const [currentState, setCurrentState] = useState<string>('');
  const [stateData, setStateData] = useState<StateMachineState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    stateMachine,
    setStateMachine,
    currentState,
    setCurrentState,
    stateData,
    setStateData,
    isLoading,
    error
  };
}
