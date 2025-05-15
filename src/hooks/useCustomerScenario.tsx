
import { useState, useEffect } from 'react';
import { useStateMachine } from '@/hooks/useStateMachine';
import { ScenarioType } from '@/components/ScenarioSelector';

/**
 * This hook is used to manage the customer scenario for the call flow
 */
export function useCustomerScenario() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the scenario state machine from the useStateMachine hook
  // Using 'studiumabschlussCase' as the default scenario
  const {
    currentState,
    stateData,
    stateMachine,
    isLoading: machineLoading,
    error: machineError,
    processSelection,
    processStartCall,
    resetStateMachine
  } = useStateMachine('studiumabschlussCase');

  // Set the loading and error states based on the state machine loading/error
  useEffect(() => {
    setIsLoading(machineLoading);
    if (machineError) {
      setError(machineError);
    }
  }, [machineLoading, machineError]);

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
