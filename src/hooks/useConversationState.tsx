
import { useState, useRef, useCallback } from 'react';

export function useConversationState() {
  // State to track conversation flow
  const [processedStates, setProcessedStates] = useState<Set<string>>(new Set());
  const [isInitialStateProcessed, setIsInitialStateProcessed] = useState(false);
  const [isUserAction, setIsUserAction] = useState(false);
  const [awaitingUserResponse, setAwaitingUserResponse] = useState(false);
  const [showNachbearbeitungModule, setShowNachbearbeitungModule] = useState(false);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date | string>(new Date());
  const [manualReset, setManualReset] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState<string[]>([]);
  const [usedResponseOptions, setUsedResponseOptions] = useState<Set<string>>(new Set());
  
  // Ref for debouncing
  const debounceTimerRef = useRef<number | null>(null);
  
  // Function to check if we've already processed this state to avoid duplicate messages
  const hasProcessedState = useCallback((state: string): boolean => {
    return processedStates.has(state);
  }, [processedStates]);
  
  // Mark a state as processed
  const markStateAsProcessed = useCallback((state: string) => {
    console.log(`Marking state as processed: ${state}`);
    setProcessedStates(prev => {
      const newSet = new Set(prev);
      newSet.add(state);
      return newSet;
    });
  }, []);

  // Add a state that requires verification - completely disabled
  const addPendingVerification = useCallback((stateId: string) => {
    console.log(`State ${stateId} requires verification but verification blocking is disabled. Auto-verifying.`);
    // We don't add to pending verifications - effectively auto-verifies
  }, []);

  // Remove a state from pending verifications
  const removePendingVerification = useCallback((stateId: string) => {
    console.log(`Removing verification for state ${stateId}`);
    setPendingVerifications(prev => prev.filter(id => id !== stateId));
  }, []);

  // Track used response options to prevent duplicate clicks
  const markResponseOptionAsUsed = useCallback((optionText: string) => {
    console.log(`Marking response option as used: "${optionText}"`);
    setUsedResponseOptions(prev => {
      const newSet = new Set(prev);
      newSet.add(optionText);
      return newSet;
    });
  }, []);

  // Check if a response option has been used
  const isResponseOptionUsed = useCallback((optionText: string): boolean => {
    return usedResponseOptions.has(optionText);
  }, [usedResponseOptions]);

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
    setPendingVerifications([]);
    setUsedResponseOptions(new Set());
    
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
    pendingVerifications: [], // Always return empty array to indicate no pending verifications
    usedResponseOptions,
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
    markResponseOptionAsUsed,
    isResponseOptionUsed,
    resetConversationState
  };
}
