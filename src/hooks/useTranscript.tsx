
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
  
  // Detect insurance numbers and addresses that require verification
  useEffect(() => {
    if (callActive && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'customer') {
        // Insurance number patterns (Swiss format)
        const insurancePatterns = [
          /(\d{3}\.\d{4}\.\d{4}\.\d{2})/i,
          /versicherungsnummer\s*:?\s*([\w\d-\.]+)/i,
          /insurance\s+number\s*:?\s*([\w\d-\.]+)/i
        ];
        
        // Address patterns
        const addressPatterns = [
          /(\w+[straße|strasse|weg|platz|gasse]\s+\d+,?\s+\d{4,5}\s+\w+)/i,
          /address\s*:?\s*([^,]+,\s*\d{4,5}\s*\w+)/i,
          /adresse\s*:?\s*([^,]+,\s*\d{4,5}\s*\w+)/i
        ];
        
        const text = lastMessage.text;
        
        // Check for insurance numbers
        for (const pattern of insurancePatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            toast({
              title: "Insurance Number Requires Verification",
              description: `Insurance number detected: ${match[1]}`,
              variant: "destructive"
            });
            
            // Trigger verification required event
            const event = new CustomEvent('verification-required', {
              detail: { type: 'insurance', value: match[1] }
            });
            window.dispatchEvent(event);
            break;
          }
        }
        
        // Check for addresses
        for (const pattern of addressPatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            toast({
              title: "Address Requires Verification",
              description: `Address detected: ${match[1]}`,
              variant: "destructive"
            });
            
            // Trigger verification required event
            const event = new CustomEvent('verification-required', {
              detail: { type: 'address', value: match[1] }
            });
            window.dispatchEvent(event);
            break;
          }
        }
      }
    }
  }, [messages, callActive, toast]);
  
  // Detect product information requests
  useEffect(() => {
    if (callActive && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'customer') {
        const productKeywords = ['product info', 'tell me about', 'more information', 'details about', 'learn more'];
        const text = lastMessage.text.toLowerCase();
        const hasProductRequest = productKeywords.some(keyword => text.includes(keyword.toLowerCase()));
        
        if (hasProductRequest) {
          // Process product information request
          processSelection('request_product_info');
          
          toast({
            title: "Product Information Request",
            description: "Customer has requested product information",
          });
        }
        
        // Detect contract cancellation requests
        const cancellationKeywords = ['cancel', 'terminate', 'end contract', 'stop service'];
        const hasCancellationRequest = cancellationKeywords.some(keyword => text.includes(keyword.toLowerCase()));
        
        if (hasCancellationRequest) {
          // Process cancellation request
          processSelection('request_cancellation');
          
          toast({
            title: "Contract Cancellation Request",
            description: "Customer has requested to cancel a contract",
            variant: "destructive"
          });
        }
      }
    }
  }, [messages, callActive, toast, processSelection]);
  
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
