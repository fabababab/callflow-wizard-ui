
import { useState, useRef, useCallback } from 'react';

export function useConversationState() {
  // State to track conversation flow
  const [processedStates, setProcessedStates] = useState<Set<string>>(new Set());
  const [isInitialStateProcessed, setIsInitialStateProcessed] = useState(false);
  const [isUserAction, setIsUserAction] = useState(false);
  const [awaitingUserResponse, setAwaitingUserResponse] = useState(false);
  const [showNachbearbeitungModule, setShowNachbearbeitungModule] = useState(false);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date>(new Date());
  
  // Ref for debouncing
  const debounceTimerRef = useRef<number | null>(null);
  
  // Function to check if we've already processed this state to avoid duplicate messages
  const hasProcessedState = useCallback((state: string): boolean => {
    return processedStates.has(state);
  }, [processedStates]);
  
  // Mark a state as processed
  const markStateAsProcessed = useCallback((state: string) => {
    setProcessedStates(prev => {
      const newSet = new Set(prev);
      newSet.add(state);
      return newSet;
    });
  }, []);

  // Reset conversation state
  const resetConversationState = useCallback(() => {
    setProcessedStates(new Set());
    setIsInitialStateProcessed(false);
    setIsUserAction(false);
    setAwaitingUserResponse(false);
    setShowNachbearbeitungModule(false);
    setLastTranscriptUpdate(new Date());
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  return {
    processedStates,
    isInitialStateProcessed,
    isUserAction,
    awaitingUserResponse,
    showNachbearbeitungModule,
    lastTranscriptUpdate,
    debounceTimerRef,
    hasProcessedState,
    markStateAsProcessed,
    setIsInitialStateProcessed,
    setIsUserAction,
    setAwaitingUserResponse,
    setShowNachbearbeitungModule,
    setLastTranscriptUpdate,
    resetConversationState
  };
}
