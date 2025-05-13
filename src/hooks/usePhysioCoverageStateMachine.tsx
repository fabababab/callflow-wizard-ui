
import { useState, useEffect } from 'react';
import { loadStateMachine, StateMachine } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';

/**
 * This hook is used to manage the state machine for the physiotherapy coverage scenario
 */
export function usePhysioCoverageStateMachine() {
  const [currentState, setCurrentState] = useState('initialState');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stateMachine, setStateMachine] = useState<StateMachine | null>(null);
  const [stateData, setStateData] = useState<any>(null);
  
  // Load the state machine on component mount
  useEffect(() => {
    const scenario: ScenarioType = 'physioTherapy';
    
    const loadScenario = async () => {
      setIsLoading(true);
      try {
        const machine = await loadStateMachine(scenario);
        setStateMachine(machine);
        
        if (machine) {
          setCurrentState(machine.initial);
          setStateData(machine.states[machine.initial]);
        } else {
          setError('Failed to load state machine');
        }
      } catch (err) {
        console.error('Error loading state machine:', err);
        setError(err instanceof Error ? err.message : 'Unknown error loading state machine');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadScenario();
  }, []);
  
  // Function to process a selection and update the state
  const processSelection = (selection: string) => {
    if (!stateMachine || !currentState) return false;
    
    const nextState = stateMachine.states[currentState]?.on?.[selection];
    if (nextState) {
      setCurrentState(nextState);
      setStateData(stateMachine.states[nextState]);
      return true;
    }
    
    return false;
  };
  
  // Function to reset the state machine
  const resetStateMachine = () => {
    if (stateMachine) {
      setCurrentState(stateMachine.initial);
      setStateData(stateMachine.states[stateMachine.initial]);
    }
  };
  
  // Function to process start call event
  const processStartCall = () => {
    return processSelection('START_CALL');
  };
  
  return {
    currentState,
    stateData,
    stateMachine,
    isLoading,
    error,
    processSelection,
    processStartCall,
    resetStateMachine
  };
}
