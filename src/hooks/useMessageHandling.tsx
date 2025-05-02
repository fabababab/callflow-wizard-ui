
import { useState, useRef, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { StateData } from '@/utils/stateMachineLoader';

export type MessageType = {
  id: string;
  text: string;
  sender: 'agent' | 'customer' | 'system';
  timestamp: Date;
  suggestions?: string[];
  isAccepted?: boolean;
  isRejected?: boolean;
  systemType?: 'info' | 'warning' | 'error' | 'success';
  responseOptions?: string[];
};

interface UseMessageHandlingProps {
  stateData: StateData | null;
  onProcessSelection: (selectedOption: string) => boolean;
  onDefaultTransition: () => boolean;
  callActive: boolean;
}

export function useMessageHandling({
  stateData,
  onProcessSelection,
  onDefaultTransition,
  callActive
}: UseMessageHandlingProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add system message
  const addSystemMessage = useCallback((text: string, systemType: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setMessages(prev => [...prev, {
      id: nanoid(),
      text,
      sender: 'system',
      timestamp: new Date(),
      systemType
    }]);
  }, []);

  // Add agent message
  const addAgentMessage = useCallback((text: string, suggestions: string[] = []) => {
    setMessages(prev => [...prev, {
      id: nanoid(),
      text,
      sender: 'agent',
      timestamp: new Date(),
      suggestions
    }]);
  }, []);

  // Add customer message
  const addCustomerMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, {
      id: nanoid(),
      text,
      sender: 'customer',
      timestamp: new Date()
    }]);
  }, []);

  // Update messages based on state data
  useEffect(() => {
    if (!callActive || !stateData) return;

    if (stateData.agent && stateData.agent.trim()) {
      addAgentMessage(stateData.agent, stateData.suggestions || []);
    }
    
    if (stateData.systemMessage && stateData.systemMessage.trim()) {
      addSystemMessage(stateData.systemMessage);
    }
    
    if (stateData.customer && stateData.customer.trim()) {
      addCustomerMessage(stateData.customer);
    }
    
    // Add response options if available
    if (stateData.responseOptions && stateData.responseOptions.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender === 'agent') {
        setMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 
            ? { ...msg, responseOptions: stateData.responseOptions }
            : msg
        ));
      }
    }
  }, [stateData, callActive, addAgentMessage, addSystemMessage, addCustomerMessage, messages]);

  // Handle sending message
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;
    
    addCustomerMessage(inputValue);
    setInputValue('');
    
    // Process default transition after customer message
    setTimeout(() => {
      onDefaultTransition();
    }, 500);
  }, [inputValue, addCustomerMessage, onDefaultTransition]);

  // Handle selecting a response option
  const handleSelectResponse = useCallback((response: string) => {
    addCustomerMessage(response);
    
    // Process selection after customer message
    setTimeout(() => {
      onProcessSelection(response);
    }, 500);
  }, [addCustomerMessage, onProcessSelection]);

  // Handle accepting suggestion
  const handleAcceptSuggestion = useCallback((messageId: string, suggestion: string) => {
    setMessages(prev => prev.map(message => 
      message.id === messageId
        ? { ...message, isAccepted: true, isRejected: false }
        : message
    ));
    
    addCustomerMessage(suggestion);
    
    // Process selection after customer message
    setTimeout(() => {
      onProcessSelection(suggestion);
    }, 500);
  }, [addCustomerMessage, onProcessSelection]);

  // Handle rejecting suggestion
  const handleRejectSuggestion = useCallback((messageId: string) => {
    setMessages(prev => prev.map(message => 
      message.id === messageId
        ? { ...message, isRejected: true, isAccepted: false }
        : message
    ));
  }, []);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
    if (!isRecording) {
      // Add simulated message after 2 seconds when recording starts
      setTimeout(() => {
        if (stateData?.customer) {
          addCustomerMessage(stateData.customer);
          setIsRecording(false);
          
          // Process default transition after simulated customer message
          setTimeout(() => {
            onDefaultTransition();
          }, 500);
        }
      }, 2000);
    }
  }, [isRecording, stateData, addCustomerMessage, onDefaultTransition]);

  return {
    messages,
    inputValue,
    setInputValue,
    isRecording,
    messagesEndRef,
    handleSendMessage,
    handleSelectResponse,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    toggleRecording,
    addAgentMessage,
    addCustomerMessage,
    addSystemMessage
  };
}
