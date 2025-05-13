
import { useState, useEffect } from 'react';
import { loadStateMachine, StateMachine } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';

export function useCustomerScenario() {
  const [currentState, setCurrentState] = useState('initialState');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stateMachine, setStateMachine] = useState<StateMachine | null>(null);
  const [stateData, setStateData] = useState<any>(null);
  
  // Load the state machine on component mount
  useEffect(() => {
    const scenario: ScenarioType = 'testscenario';
    
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
  
  return {
    currentState,
    setCurrentState,
    error,
    isLoading,
    stateMachine,
    stateData
  };
}
