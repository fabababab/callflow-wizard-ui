
import { useState, useRef, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';
import { ScenarioType } from '@/components/ScenarioSelector';
import { detectSensitiveData, ValidationStatus } from '@/data/scenarioData';
import { useStateMachine } from '@/hooks/useStateMachine';

type Message = {
  id: string;
  text: string;
  sender: 'agent' | 'customer' | 'system';
  timestamp: Date;
  responseOptions?: string[];
  sensitiveData?: Array<{
    id: string;
    type: string;
    value: string;
    status: ValidationStatus;
    notes?: string;
    requiresVerification?: boolean;
  }>;
  requiresVerification?: boolean;
  isVerified?: boolean;
};

export function useTranscript(activeScenario: ScenarioType) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [acceptedCallId, setAcceptedCallId] = useState<string | null>(null);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date>(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sensitiveDataStats, setSensitiveDataStats] = useState<{
    validated: number;
    pending: number;
    invalid: number;
  }>({ validated: 0, pending: 0, invalid: 0 });
  const [verificationBlocking, setVerificationBlocking] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Get the state machine data
  const {
    currentState,
    stateData,
    processSelection,
    lastStateChange
  } = useStateMachine(activeScenario);
  
  // Update to properly update UI when state changes
  useEffect(() => {
    if (stateData && callActive && lastStateChange) {
      // When state changes, check for messages to display
      if (stateData.meta?.systemMessage) {
        addSystemMessage(stateData.meta.systemMessage, stateData.requiresVerification);
      }
      
      if (stateData.meta?.agentText) {
        addAgentMessage(stateData.meta.agentText, stateData.meta.suggestions || []);
      }
      
      setLastTranscriptUpdate(new Date());
    }
  }, [stateData, lastStateChange, callActive]);
  
  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update timer when call is active
  useEffect(() => {
    if (callActive) {
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setElapsedTime(
          `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callActive]);

  // Add a system message
  const addSystemMessage = (text: string, requiresVerification: boolean = false) => {
    setMessages(prev => [
      ...prev,
      {
        id: nanoid(),
        text,
        sender: 'system',
        timestamp: new Date(),
        requiresVerification,
        isVerified: !requiresVerification
      }
    ]);
    
    if (requiresVerification) {
      setVerificationBlocking(true);
    }
  };

  // Add an agent message
  const addAgentMessage = (text: string, responseOptions: string[] = []) => {
    setMessages(prev => [
      ...prev,
      {
        id: nanoid(),
        text,
        sender: 'agent',
        timestamp: new Date(),
        responseOptions
      }
    ]);
  };

  // Add a customer message with sensitive data detection
  const addCustomerMessage = (text: string, responseOptions: string[] = []) => {
    // Detect sensitive data in the message
    const sensitiveData = detectSensitiveData(text);
    
    // Check if any sensitive data requires verification
    const hasVerificationRequired = sensitiveData.some(data => data.requiresVerification);
    
    // If sensitive data is found, show a toast notification
    if (sensitiveData.length > 0) {
      toast({
        title: "Sensitive Data Detected",
        description: hasVerificationRequired 
          ? `${sensitiveData.length} sensitive data fields found that require verification` 
          : `${sensitiveData.length} sensitive data fields found in message`,
        variant: hasVerificationRequired ? "destructive" : "default"
      });
      
      // Update sensitive data stats
      setSensitiveDataStats(prev => ({
        ...prev,
        pending: prev.pending + sensitiveData.length
      }));
      
      // Block progress if verification is required
      if (hasVerificationRequired) {
        setVerificationBlocking(true);
      }
    }
    
    setMessages(prev => [
      ...prev,
      {
        id: nanoid(),
        text,
        sender: 'customer',
        timestamp: new Date(),
        responseOptions,
        sensitiveData: sensitiveData.length > 0 ? sensitiveData : undefined,
      }
    ]);
  };

  // Handle validating sensitive data
  const handleValidateSensitiveData = (messageId: string, fieldId: string, status: ValidationStatus, notes?: string) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId && message.sensitiveData) {
        const updatedFields = message.sensitiveData.map(field => {
          if (field.id === fieldId) {
            const previousStatus = field.status;
            
            // Update stats based on status change
            if (previousStatus !== status) {
              setSensitiveDataStats(stats => {
                const newStats = { ...stats };
                if (previousStatus === 'pending') newStats.pending--;
                else if (previousStatus === 'valid') newStats.validated--;
                else if (previousStatus === 'invalid') newStats.invalid--;
                
                if (status === 'pending') newStats.pending++;
                else if (status === 'valid') newStats.validated++;
                else if (status === 'invalid') newStats.invalid++;
                
                return newStats;
              });
            }
            
            // If this is a required verification field being marked as valid or invalid
            // check if we can unblock the conversation
            if (field.requiresVerification && (status === 'valid' || status === 'invalid')) {
              checkIfVerificationComplete();
            }
            
            return { ...field, status, notes };
          }
          return field;
        });
        
        return { ...message, sensitiveData: updatedFields };
      }
      return message;
    }));
    
    // Show validation toast
    toast({
      title: status === 'valid' ? "Validated" : "Validation Failed",
      description: `Customer data marked as ${status}`,
      variant: status === 'valid' ? "default" : "destructive"
    });
  };
  
  // Check if all required verifications are completed
  const checkIfVerificationComplete = () => {
    // Check all messages with sensitive data that require verification
    const allVerified = messages.every(message => {
      if (!message.sensitiveData) return true;
      
      // Check if any sensitive data field requires verification but is still pending
      return !message.sensitiveData.some(field => 
        field.requiresVerification && field.status === 'pending'
      );
    });
    
    if (allVerified) {
      setVerificationBlocking(false);
      toast({
        title: "All Required Verifications Completed",
        description: "The conversation can now continue",
        variant: "default"
      });
    }
  };

  // Handle verifying system check
  const handleVerifySystemCheck = (messageId: string) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId && message.requiresVerification) {
        return { ...message, isVerified: true };
      }
      return message;
    }));
    
    // Unblock the scenario progress
    setVerificationBlocking(false);
    
    toast({
      title: "Verification Complete",
      description: "The system check has been verified and the scenario can continue",
      variant: "default"
    });
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add message based on who is sending it
    addAgentMessage(inputValue);
    setInputValue('');

    // Process the selected option in the state machine
    processSelection(inputValue);
  };

  // Handle accepting a suggestion
  const handleAcceptSuggestion = (messageId: string, suggestionId: string) => {
    // Find the suggestion text by ID
    const suggestionText = stateData?.suggestions?.find((_, index) => index.toString() === suggestionId);
    
    if (suggestionText) {
      // Add the accepted suggestion as a new agent message
      addAgentMessage(suggestionText);
      
      // Process the selected option in the state machine
      processSelection(suggestionText);
    }
  };

  // Handle rejecting a suggestion
  const handleRejectSuggestion = (suggestionId: string, messageId: string) => {
    // For now, just log the rejection
    console.log(`Suggestion ${suggestionId} rejected for message ${messageId}`);
  };

  // Handle selecting a response
  const handleSelectResponse = (response: string) => {
    addAgentMessage(response);
    processSelection(response);
  };

  // Toggle recording state
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // Start a call
  const handleCall = () => {
    setCallActive(!callActive);
    setLastTranscriptUpdate(new Date());
    
    if (!callActive) {
      addSystemMessage('Call started');
      
      // If we have initial state data, display it
      if (stateData) {
        if (stateData.meta?.systemMessage) {
          addSystemMessage(stateData.meta.systemMessage);
        }
        
        if (stateData.meta?.agentText) {
          addAgentMessage(stateData.meta.agentText, stateData.meta.suggestions || []);
        }
      }
    } else {
      addSystemMessage('Call ended');
    }
  };

  // Accept incoming call
  const handleAcceptCall = (callId: string) => {
    setAcceptedCallId(callId);
    setCallActive(true);
    setLastTranscriptUpdate(new Date());
    addSystemMessage(`Call accepted from ${callId}`);
    
    // If we have initial state data, display it
    if (stateData) {
      if (stateData.meta?.systemMessage) {
        addSystemMessage(stateData.meta.systemMessage);
      }
      
      if (stateData.meta?.agentText) {
        addAgentMessage(stateData.meta.agentText, stateData.meta.suggestions || []);
      }
    }
  };

  // Hang up call
  const handleHangUpCall = () => {
    setCallActive(false);
    setAcceptedCallId(null);
    setLastTranscriptUpdate(new Date());
    addSystemMessage('Call ended');
  };
  
  return {
    messages,
    inputValue,
    setInputValue,
    isRecording,
    callActive,
    elapsedTime,
    acceptedCallId,
    lastTranscriptUpdate,
    messagesEndRef,
    handleSendMessage,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    handleSelectResponse,
    toggleRecording,
    handleCall,
    handleAcceptCall,
    handleHangUpCall,
    currentState,
    stateData,
    lastStateChange,
    addAgentMessage,
    addCustomerMessage,
    addSystemMessage
  };
}
