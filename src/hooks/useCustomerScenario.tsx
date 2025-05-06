
import { useState, useEffect } from 'react';
import { useStateMachine } from '@/hooks/useStateMachine';

/**
 * This hook is used to manage the customer scenario for the physiotherapy coverage scenario
 */
export function useCustomerScenario() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the scenario state machine from the useStateMachine hook
  const {
    currentState,
    stateData,
    stateMachine,
    isLoading: machineLoading,
    error: machineError,
    processSelection,
    processStartCall,
    resetStateMachine
  } = useStateMachine('testscenario');

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
