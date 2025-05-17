import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing conversation state
 */
export function useConversationState(instanceId = 'default') {
  // Keep track of the last conversation update timestamp
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date>(new Date());
  
  // Keep track of whether we're waiting for the user to respond
  const [awaitingUserResponse, setAwaitingUserResponse] = useState<boolean>(false);
  
  // Flag for if the current action is user-initiated
  const [isUserAction, setIsUserAction] = useState<boolean>(false);
  
  // Track processed states to avoid duplicate messages
  const [processedStates, setProcessedStates] = useState<Set<string>>(new Set());
  
  // Reference to the debounce timer
  const debounceTimerRef = useRef<number | null>(null);
  
  // Track pending verification states
  const [pendingVerifications, setPendingVerifications] = useState<Set<string>>(new Set());
  
  // Track if the Nachbearbeitung module should be shown
  const [showNachbearbeitungModule, setShowNachbearbeitungModule] = useState<boolean>(false);
  
  // Initialize conversation
  const [hasInitializedConversation, setHasInitializedConversation] = useState<boolean>(false);

  /**
   * Check if a state has been processed
   */
  const hasProcessedState = useCallback((stateId: string) => {
    return processedStates.has(stateId);
  }, [processedStates]);
  
  /**
   * Mark a state as processed
   */
  const markStateAsProcessed = useCallback((stateId: string) => {
    setProcessedStates(prev => {
      const updated = new Set(prev);
      updated.add(stateId);
      return updated;
    });
    console.log(`[${instanceId}] Marked state ${stateId} as processed`);
  }, [instanceId]);
  
  /**
   * Add a state to pending verifications
   */
  const addPendingVerification = useCallback((stateId: string) => {
    setPendingVerifications(prev => {
      const updated = new Set(prev);
      updated.add(stateId);
      return updated;
    });
    console.log(`[${instanceId}] Added pending verification for state ${stateId}`);
  }, [instanceId]);
  
  /**
   * Remove a state from pending verifications
   */
  const removePendingVerification = useCallback((stateId: string) => {
    setPendingVerifications(prev => {
      const updated = new Set(prev);
      updated.delete(stateId);
      return updated;
    });
    console.log(`[${instanceId}] Removed pending verification for state ${stateId}`);
  }, [instanceId]);
  
  /**
   * Reset the conversation state
   */
  const resetConversationState = useCallback(() => {
    console.log(`[${instanceId}] Resetting conversation state`);
    setProcessedStates(new Set());
    setPendingVerifications(new Set());
    setAwaitingUserResponse(false);
    setIsUserAction(false);
    setShowNachbearbeitungModule(false);
    setHasInitializedConversation(false);
    
    // Clear any debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, [instanceId]);

  return {
    lastTranscriptUpdate,
    setLastTranscriptUpdate,
    awaitingUserResponse,
    setAwaitingUserResponse,
    isUserAction,
    setIsUserAction,
    processedStates,
    debounceTimerRef,
    pendingVerifications,
    showNachbearbeitungModule,
    setShowNachbearbeitungModule,
    hasProcessedState,
    markStateAsProcessed,
    addPendingVerification,
    removePendingVerification,
    resetConversationState,
    hasInitializedConversation,
    setHasInitializedConversation,
    instanceId
  };
}
