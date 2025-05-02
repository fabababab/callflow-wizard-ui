
import { useState, useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { loadStateMachine, getInitialState, getStateData, getNextState } from '@/utils/stateMachineLoader';

export const useCustomerScenario = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState('');
  const [stateMachine, setStateMachine] = useState<any>(null);

  const startConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load the "customerPhysioCoverage" state machine
      const loadedMachine = await loadStateMachine('customerPhysioCoverage');
      
      if (!loadedMachine) {
        throw new Error('Failed to load the customer scenario state machine');
      }
      
      setStateMachine(loadedMachine);
      const initialState = getInitialState(loadedMachine);
      setCurrentState(initialState);
      setIsLoading(false);
      
    } catch (error) {
      setError('Failed to start the conversation: ' + (error instanceof Error ? error.message : String(error)));
      setIsLoading(false);
    }
  }, []);

  const resetConversation = useCallback(() => {
    if (stateMachine) {
      const initialState = getInitialState(stateMachine);
      setCurrentState(initialState);
      setError(null);
    }
  }, [stateMachine]);

  const processAgentResponse = useCallback((response: string) => {
    if (!stateMachine || !currentState) return;
    
    try {
      const nextState = getNextState(stateMachine, currentState, response);
      
      if (nextState) {
        setCurrentState(nextState);
      } else {
        console.warn(`No transition found for response "${response}" in state "${currentState}"`);
      }
    } catch (err) {
      console.error('Error processing agent response:', err);
      setError('Error processing your response');
    }
  }, [currentState, stateMachine]);

  // Get customer text for the current state
  const getCustomerText = useCallback(() => {
    if (!stateMachine || !currentState) return '';
    
    const stateData = getStateData(stateMachine, currentState);
    if (!stateData) return '';
    
    return stateData.meta?.agentText || stateData.text || '';
  }, [currentState, stateMachine]);

  // Get agent response options for the current state
  const getAgentOptions = useCallback(() => {
    if (!stateMachine || !currentState) return [];
    
    const stateData = getStateData(stateMachine, currentState);
    if (!stateData) return [];
    
    return stateData.meta?.responseOptions || stateData.responseOptions || 
           (stateData.on ? Object.keys(stateData.on).filter(key => key !== 'DEFAULT') : []);
  }, [currentState, stateMachine]);

  // Get system message for the current state
  const getSystemMessage = useCallback(() => {
    if (!stateMachine || !currentState) return '';
    
    const stateData = getStateData(stateMachine, currentState);
    if (!stateData || !stateData.meta) return '';
    
    return stateData.meta.systemMessage || '';
  }, [currentState, stateMachine]);

  // Check if the current state is a final state
  const isFinalState = useCallback(() => {
    if (!stateMachine || !currentState) return false;
    
    const stateData = getStateData(stateMachine, currentState);
    if (!stateData) return false;
    
    // A state is final if it has no outgoing transitions
    return (!stateData.on || Object.keys(stateData.on).length === 0) && !stateData.nextState;
  }, [currentState, stateMachine]);

  return {
    currentState,
    isLoading,
    error,
    startConversation,
    resetConversation,
    processAgentResponse,
    getCustomerText,
    getAgentOptions,
    getSystemMessage,
    isFinalState,
    setCurrentState // Expose this method for manual state transitions
  };
};
