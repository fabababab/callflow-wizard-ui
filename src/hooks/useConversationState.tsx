
import { useState, useRef, useCallback } from 'react';

export function useConversationState() {
  // State to track conversation flow
  const [processedStates, setProcessedStates] = useState<Set<string>>(new Set());
  const [isInitialStateProcessed, setIsInitialStateProcessed] = useState(false);
  const [isUserAction, setIsUserAction] = useState(false);
  const [awaitingUserResponse, setAwaitingUserResponse] = useState(false);
  const [showNachbearbeitungModule, setShowNachbearbeitungModule] = useState(false);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date>(new Date());
  const [manualReset, setManualReset] = useState(false);
  
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

  // Reset conversation state - but only reset the tracking, not erase messages
  const resetConversationState = useCallback((shouldResetMessages = false) => {
    console.log("Resetting conversation state tracking. Reset messages:", shouldResetMessages);
    setProcessedStates(new Set());
    setIsInitialStateProcessed(false);
    setIsUserAction(false);
    setAwaitingUserResponse(false);
    setShowNachbearbeitungModule(false);
    setLastTranscriptUpdate(new Date());
    setManualReset(shouldResetMessages);
    
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
    manualReset,
    debounceTimerRef,
    hasProcessedState,
    markStateAsProcessed,
    setIsInitialStateProcessed,
    setIsUserAction,
    setAwaitingUserResponse,
    setShowNachbearbeitungModule,
    setLastTranscriptUpdate,
    setManualReset,
    resetConversationState
  };
}
