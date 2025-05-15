import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/lib/use-toast.tsx';
import { useConversationState } from '@/hooks/useConversationState';
import { useCallState } from '@/hooks/useCallState';
import { useMessageHandling } from '@/hooks/useMessageHandling';
import { useStateMachine } from '@/hooks/useStateMachine';
import { useModuleManager } from '@/hooks/useModuleManager';
import { useNachbearbeitungHandler } from '@/hooks/useNachbearbeitungHandler';
import { useCallTermination } from '@/hooks/useCallTermination';
import { ScenarioType } from '@/components/ScenarioSelector';
import { ValidationStatus } from '@/data/scenarioData';

export function useTranscriptCore(activeScenario: ScenarioType) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date>(new Date());
  const { toast } = useToast();
  
  // Use the conversation state hook to manage conversation state
  const conversationState = useConversationState();
  
  // Use the call state hook to manage call state
  const callState = useCallState();
  
  // Use the message handling hook to manage messages
  const messageHandling = useMessageHandling();
  
  // Use the scenario state machine from the useStateMachine hook
  const stateMachine = useStateMachine(activeScenario);
  
  // Use the module manager hook
  const { activeModule, completeModule } = useModuleManager();
  
  // Use the nachbearbeitung handler with correct arguments
  const { showNachbearbeitungSummary } = useNachbearbeitungHandler(
    completeModule, 
    activeScenario
  );
  
  // Use the call termination hook
  const { handleHangUpCall } = useCallTermination({
    callState,
    stateMachine,
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
    stateMachine.processStartCall();
  }, [callState, messageHandling, stateMachine]);
  
  // Function to handle selecting a response
  const handleSelectResponse = useCallback((selection: string) => {
    console.log(`Selected response: ${selection}`);
    
    // Add agent message
    messageHandling.addAgentMessage(selection);
    
    // Process the selection
    stateMachine.processSelection(selection);
  }, [messageHandling, stateMachine]);
  
  // Function to handle verifying a system check
  const handleVerifySystemCheck = useCallback((messageId: string) => {
    console.log(`Verifying system check: ${messageId}`);
    
    // Use the message handling function
    messageHandling.handleVerifySystemCheck(messageId);
    
    // Force re-render to update transcript
    setLastTranscriptUpdate(new Date());
  }, [messageHandling]);
  
  // Function to handle validating sensitive data
  const handleValidateSensitiveData = useCallback((fieldId: string, isValid: boolean, notes?: string) => {
    console.log(`Validating sensitive data: ${fieldId} - ${isValid ? 'valid' : 'invalid'}`);
    
    // Map boolean isValid to ValidationStatus
    const status: ValidationStatus = isValid ? 'valid' : 'invalid';
    
    // Use the message handling function
    messageHandling.updateSensitiveField(fieldId, status, notes);
    
    // Force re-render to update transcript
    setLastTranscriptUpdate(new Date());
  }, [messageHandling]);
  
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
    messageHandling.handleInlineModuleComplete(messageId, moduleId, result);
    
    // Force re-render to update transcript
    setLastTranscriptUpdate(new Date());
  }, [messageHandling]);

  // Function to reset the conversation
  const resetConversation = useCallback(() => {
    console.log('Resetting conversation...');
    
    // Reset state machine
    stateMachine.resetStateMachine();
    
    // Clear messages
    messageHandling.clearMessages();
    
    // Add system message
    messageHandling.addSystemMessage('Conversation reset.');
  }, [stateMachine, messageHandling]);

  // Add initial loading message when component mounts
  useEffect(() => {
    // Check if we need to add an initial message
    if (messageHandling.messages.length === 0) {
      console.log('Adding initial welcome message');
      messageHandling.addSystemMessage('Willkommen! Starten Sie einen Anruf, um das Szenario zu beginnen.');
    }
  }, [messageHandling]);

  return {
    messages: messageHandling.messages,
    callActive: callState.callActive,
    setCallActive: callState.setCallActive,
    currentState: stateMachine.currentState,
    stateData: stateMachine.stateData,
    handleCall,
    handleSelectResponse,
    handleVerifySystemCheck,
    handleValidateSensitiveData,
    messagesEndRef,
    lastTranscriptUpdate,
    activeModule,
    completeModule,
    handleModuleComplete,
    handleInlineModuleComplete,
    handleHangUpCall,
    resetConversation
  };
}
