import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useConversationState } from '@/hooks/useConversationState';
import { useCallState } from '@/hooks/useCallState';
import { useMessageHandling } from '@/hooks/useMessageHandling';
import { useStateMachine } from '@/hooks/useStateMachine';
import { useModuleCompletion } from '@/hooks/useModuleCompletion';
import { useModuleManager } from '@/hooks/useModuleManager';
import { useNachbearbeitungHandler } from '@/hooks/useNachbearbeitungHandler';
import { useCallTermination } from '@/hooks/useCallTermination';
import { ScenarioType } from '@/components/ScenarioSelector';

export function useTranscriptCore(activeScenario: ScenarioType) {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState(Date.now());
  
  // Use the conversation state hook to manage conversation state
  const conversationState = useConversationState();
  
  // Use the call state hook to manage call state
  const callState = useCallState();
  
  // Use the message handling hook to manage messages
  const messageHandling = useMessageHandling(conversationState.addMessage);
  
  // Use the scenario state machine from the useStateMachine hook
  const {
    currentState,
    stateData,
    processSelection,
    processStartCall,
    resetStateMachine,
    selectedStateMachine
  } = useStateMachine(activeScenario);
  
  // Use the module completion hook to handle module events
  const { activeModule, completeModule } = useModuleManager();
  
  // Use the nachbearbeitung handler
  const { showNachbearbeitungSummary } = useNachbearbeitungHandler(completeModule, activeScenario);
  
  // Use the call termination hook
  const { handleHangUpCall } = useCallTermination({
    callState,
    stateMachine: { resetStateMachine },
    messageHandling,
    conversationState,
    showNachbearbeitungSummary,
    toast,
    activeScenario
  });
  
  // Function to handle starting a call
  const handleCall = useCallback(() => {
    console.log('Starting call...');
    
    // Set call as active
    callState.setCallActive(true);
    
    // Add system message
    messageHandling.addSystemMessage('Call started.');
    
    // Start the state machine
    processStartCall();
  }, [callState, messageHandling, processStartCall]);
  
  // Function to handle selecting a response
  const handleSelectResponse = useCallback((selection: string) => {
    console.log(`Selected response: ${selection}`);
    
    // Add agent message
    messageHandling.addAgentMessage(selection);
    
    // Process the selection
    processSelection(selection);
  }, [messageHandling, processSelection]);
  
  // Function to handle verifying a system check
  const handleVerifySystemCheck = useCallback((fieldId: string, isValid: boolean, notes?: string) => {
    console.log(`Verifying system check: ${fieldId} - ${isValid}`);
    
    // Update the state with the verification result
    conversationState.updateSensitiveField(fieldId, isValid ? 'valid' : 'invalid', notes);
    
    // Force re-render to update transcript
    setLastTranscriptUpdate(Date.now());
  }, [conversationState]);
  
  // Function to handle validating sensitive data
  const handleValidateSensitiveData = useCallback((fieldId: string, isValid: boolean, notes?: string) => {
    console.log(`Validating sensitive data: ${fieldId} - ${isValid}`);
    
    // Update the state with the validation result
    conversationState.updateSensitiveField(fieldId, isValid ? 'valid' : 'invalid', notes);
    
    // Force re-render to update transcript
    setLastTranscriptUpdate(Date.now());
  }, [conversationState]);
  
  // Function to handle module completion
  const handleModuleComplete = useCallback((result: any) => {
    console.log('Module completed with result:', result);
    
    // Complete the module
    completeModule(result);
  }, [completeModule]);

  // Function to handle inline module completion
  const handleInlineModuleComplete = useCallback((messageId: string, moduleId: string, result: any) => {
    console.log(`Inline module ${moduleId} completed in message ${messageId} with result:`, result);
    
    // Update the message with the module result
    conversationState.updateMessageModuleResult(messageId, moduleId, result);
    
    // Force re-render to update transcript
    setLastTranscriptUpdate(Date.now());
  }, [conversationState]);

  // Function to reset the conversation
  const resetConversation = useCallback(() => {
    console.log('Resetting conversation...');
    
    // Reset state machine
    resetStateMachine();
    
    // Reset conversation state tracking and clear messages
    conversationState.resetConversationState(true);
    
    // Add system message
    messageHandling.addSystemMessage('Conversation reset.');
  }, [resetStateMachine, conversationState, messageHandling]);

  return {
    messages: conversationState.messages,
    addMessage: conversationState.addMessage,
    updateMessage: conversationState.updateMessage,
    updateMessageModuleResult: conversationState.updateMessageModuleResult,
    sensitiveFields: conversationState.sensitiveFields,
    updateSensitiveField: conversationState.updateSensitiveField,
    getSensitiveDataVerificationStatus: conversationState.getSensitiveDataVerificationStatus,
    callActive: callState.callActive,
    setCallActive: callState.setCallActive,
    currentState,
    stateData,
    selectedStateMachine,
    handleCall,
    handleSelectResponse,
    handleVerifySystemCheck,
    handleValidateSensitiveData,
    messagesEndRef,
    lastTranscriptUpdate,
    activeModule,
    completeModule,
    handleHangUpCall,
    resetConversation
  };
}
