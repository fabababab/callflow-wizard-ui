import { useState, useRef, useCallback } from 'react';

export function useConversationState() {
  // State to track conversation flow
  const [processedStates, setProcessedStates] = useState<Set<string>>(new Set());
  const [toastsShown, setToastsShown] = useState<Set<string>>(new Set()); // For tracking toasts per state
  const [isInitialStateProcessed, setIsInitialStateProcessed] = useState(false);
  const [isUserAction, setIsUserAction] = useState(false);
  const [awaitingUserResponse, setAwaitingUserResponse] = useState(false);
  const [showNachbearbeitungModule, setShowNachbearbeitungModule] = useState(false);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date | string>(new Date());
  const [manualReset, setManualReset] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState<Set<string>>(new Set());
  
  // Ref for debouncing
  const debounceTimerRef = useRef<number | null>(null);
  
  // Function to check if we've already processed this state to avoid duplicate messages
  const hasProcessedState = useCallback((state: string): boolean => {
    return processedStates.has(state);
  }, [processedStates]);
  
  // Mark a state as processed
  const markStateAsProcessed = useCallback((state: string) => {
    console.log(`Marking state as processed: ${state}`);
    setProcessedStates(prev => new Set(prev).add(state));
  }, []);

  // Add a state that requires verification - completely disabled
  const addPendingVerification = useCallback((stateId: string) => {
    console.log(`State ${stateId} requires verification but verification blocking is disabled. Auto-verifying.`);
    setPendingVerifications(prev => new Set(prev).add(stateId));
  }, []);

  // Remove a state from pending verifications
  const removePendingVerification = useCallback((stateId: string) => {
    console.log(`Removing verification for state ${stateId}`);
    setPendingVerifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(stateId);
      return newSet;
    });
  }, []);

  // Reset conversation state - but only reset the tracking, not erase messages
  const resetConversationState = useCallback((clearProcessedStates = true) => {
    console.log("Resetting conversation state tracking. Reset messages:", clearProcessedStates);
    if (clearProcessedStates) {
      setProcessedStates(new Set());
      setToastsShown(new Set()); // Reset toasts as well
    }
    setIsInitialStateProcessed(false);
    setIsUserAction(false);
    setAwaitingUserResponse(false);
    setShowNachbearbeitungModule(false);
    setLastTranscriptUpdate(new Date());
    setManualReset(clearProcessedStates);
    setPendingVerifications(new Set());
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const markToastShown = useCallback((state: string) => {
    setToastsShown(prev => new Set(prev).add(state));
  }, []);

  const hasShownToastFor = useCallback((state: string): boolean => {
    return toastsShown.has(state);
  }, [toastsShown]);

  return {
    processedStates,
    toastsShown, // expose for debugging if needed
    isInitialStateProcessed,
    isUserAction,
    awaitingUserResponse,
    showNachbearbeitungModule,
    lastTranscriptUpdate,
    manualReset,
    pendingVerifications,
    debounceTimerRef,
    hasProcessedState,
    markStateAsProcessed,
    setIsInitialStateProcessed,
    setIsUserAction,
    setAwaitingUserResponse,
    setShowNachbearbeitungModule,
    setLastTranscriptUpdate,
    setManualReset,
    addPendingVerification,
    removePendingVerification,
    resetConversationState,
    markToastShown,
    hasShownToastFor
  };
}
