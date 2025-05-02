
import { useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useCallManagement } from './useCallManagement';
import { useStateMachine } from './useStateMachine';
import { useMessageHandling } from './useMessageHandling';

export const useTranscript = (activeScenario: ScenarioType) => {
  const { toast } = useToast();
  
  // Set up call management
  const {
    callActive,
    elapsedTime,
    acceptedCallId,
    startCall,
    endCall,
    acceptCall,
    handleCall
  } = useCallManagement();
  
  // Set up state machine
  const {
    currentState,
    stateData,
    isLoading,
    error,
    processSelection,
    processDefaultTransition,
    resetStateMachine
  } = useStateMachine(activeScenario);
  
  // Set up message handling
  const {
    messages,
    inputValue,
    setInputValue,
    isRecording,
    messagesEndRef,
    handleSendMessage,
    handleSelectResponse,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    toggleRecording
  } = useMessageHandling({
    stateData,
    onProcessSelection: processSelection,
    onDefaultTransition: processDefaultTransition,
    callActive
  });
  
  // Reset state machine when scenario changes and call is active
  useEffect(() => {
    if (callActive) {
      resetStateMachine();
    }
  }, [activeScenario, callActive, resetStateMachine]);
  
  // Trigger contact identification based on keywords in the transcript
  useEffect(() => {
    if (callActive && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'customer') {
        const keywords = ['my name is', 'this is', 'speaking', 'michael', 'schmidt', 'mein name ist'];
        const text = lastMessage.text.toLowerCase();
        const hasKeyword = keywords.some(keyword => text.includes(keyword.toLowerCase()));
        
        if (hasKeyword && !document.getElementById('contact-identified')) {
          // Simulate that system identified the contact
          const event = new CustomEvent('contact-identified', {
            detail: { name: 'Michael Schmidt', confidence: 0.89 }
          });
          window.dispatchEvent(event);
          
          toast({
            title: "Contact Identified",
            description: "Michael Schmidt identified with 89% confidence",
          });
        }
      }
    }
  }, [messages, callActive, toast]);
  
  // Handle starting a call with reset state
  const handleStartCall = useCallback(() => {
    startCall();
    resetStateMachine();
  }, [startCall, resetStateMachine]);

  // Log errors from state machine loading
  useEffect(() => {
    if (error) {
      console.error('State machine error:', error);
      toast({
        title: "Error loading scenario",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return {
    // Call state
    callActive,
    elapsedTime,
    acceptedCallId,
    
    // Message state
    messages,
    inputValue,
    setInputValue,
    isRecording,
    messagesEndRef,
    
    // State machine state
    currentState,
    stateData,
    isLoading,
    
    // Message handlers
    handleSendMessage,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    handleSelectResponse,
    toggleRecording,
    
    // Call handlers
    handleCall,
    handleAcceptCall: acceptCall
  };
};
