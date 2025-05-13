
import { useMemo } from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';

export function useTranscript(stateMachine: StateMachine | null) {
  // This hook provides transcript functionality based on the state machine
  
  const transcriptData = useMemo(() => {
    if (!stateMachine) {
      return {
        messages: [],
        currentState: '',
      };
    }
    
    // Get initial state data
    const initialState = stateMachine.initial;
    const initialStateData = stateMachine.states[initialState];
    
    // Create initial messages from the state machine
    const initialMessages = [];
    
    if (initialStateData?.meta?.systemMessage) {
      initialMessages.push({
        id: 'system-1',
        type: 'system',
        content: initialStateData.meta.systemMessage,
        timestamp: new Date()
      });
    }
    
    if (initialStateData?.meta?.agentText) {
      initialMessages.push({
        id: 'agent-1',
        type: 'agent',
        content: initialStateData.meta.agentText,
        timestamp: new Date()
      });
    }
    
    return {
      messages: initialMessages,
      currentState: initialState,
      stateData: initialStateData
    };
  }, [stateMachine]);
  
  return transcriptData;
}
