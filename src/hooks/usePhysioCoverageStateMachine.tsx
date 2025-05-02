
import { useState, useCallback } from 'react';
import { loadStateMachine, getInitialState, getStateData, getNextState } from '@/utils/stateMachineLoader';

export const usePhysioCoverageStateMachine = () => {
  const [currentState, setCurrentState] = useState('');
  const [stateMachine, setStateMachine] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const startConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load the physio coverage state machine
      const loadedMachine = await loadStateMachine('physioCoverage');
      
      if (!loadedMachine) {
        throw new Error('Failed to load the state machine');
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
  
  const processEvent = useCallback((event: string) => {
    if (!stateMachine || !currentState) return;
    
    try {
      const nextState = getNextState(stateMachine, currentState, event);
      
      if (nextState) {
        setCurrentState(nextState);
      } else {
        console.warn(`No transition found for event "${event}" in state "${currentState}"`);
      }
    } catch (err) {
      console.error('Error processing event:', err);
      setError('Error processing your selection');
    }
  }, [currentState, stateMachine]);
  
  const getAgentText = useCallback(() => {
    if (!stateMachine || !currentState) return '';
    
    const stateData = getStateData(stateMachine, currentState);
    if (!stateData) return '';
    
    return stateData.meta?.agentText || stateData.text || '';
  }, [currentState, stateMachine]);
  
  const getSuggestions = useCallback(() => {
    if (!stateMachine || !currentState) return [];
    
    const stateData = getStateData(stateMachine, currentState);
    if (!stateData) return [];
    
    return stateData.meta?.suggestions || stateData.suggestions || 
           (stateData.on ? Object.keys(stateData.on).filter(key => key !== 'DEFAULT') : []);
  }, [currentState, stateMachine]);
  
  const getSystemMessage = useCallback(() => {
    if (!stateMachine || !currentState) return '';
    
    const stateData = getStateData(stateMachine, currentState);
    if (!stateData || !stateData.meta) return '';
    
    return stateData.meta.systemMessage || '';
  }, [currentState, stateMachine]);
  
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
    processEvent,
    getAgentText,
    getSuggestions,
    getSystemMessage,
    isFinalState,
    setCurrentState // Expose this method for manual state transitions
  };
};
