
import { useState, useRef, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/transcript/Message';
import { AISuggestion } from '@/components/transcript/AISuggestion';

interface MessageHandlingProps {
  stateData: any;
  onProcessSelection: (selection: string) => boolean;
  onDefaultTransition: () => boolean;
  callActive: boolean;
  isAgentMode?: boolean;
}

export function useMessageHandling({
  stateData,
  onProcessSelection,
  onDefaultTransition,
  callActive,
  isAgentMode = false
}: MessageHandlingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Send a message from the user or agent depending on mode
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || !callActive) return;

    const newMessage: Message = {
      id: nanoid(),
      text: inputValue,
      sender: isAgentMode ? 'agent' : 'customer',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Try to process the selection, if it doesn't match any transition
    // we just let the message stand as free text
    onProcessSelection(inputValue);
    
    // Scroll to bottom after message is sent
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [inputValue, callActive, isAgentMode, onProcessSelection]);

  // Handle selecting a response option
  const handleSelectResponse = useCallback((response: string) => {
    if (!callActive) return;
    
    // Special handling for product information and contract cancellation
    if (response.includes('product_info:')) {
      const productName = response.split('product_info:')[1].trim();
      const newMessage: Message = {
        id: nanoid(),
        text: `I'd like more information about ${productName}`,
        sender: isAgentMode ? 'agent' : 'customer',
        timestamp: new Date(),
        productInfo: {
          name: productName,
          videoUrl: `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0`, // Example video URL
          description: `${productName} is our premium service that includes comprehensive coverage and 24/7 customer support.`,
          details: ["Coverage in all EU countries", "No hidden fees", "Premium customer support", "Mobile app access"]
        }
      };
      
      setMessages(prev => [...prev, newMessage]);
      onProcessSelection('show_product_info');
    } 
    else if (response.includes('cancel_contract:')) {
      const contractType = response.split('cancel_contract:')[1].trim();
      const contracts = [
        { id: "c-1001", name: "Health Insurance Basic", startDate: "2020-01-15", monthly: "€49.99" },
        { id: "c-1002", name: "Home Insurance Premium", startDate: "2021-03-10", monthly: "€35.50" },
        { id: "c-1003", name: "Car Insurance Full Coverage", startDate: "2019-11-22", monthly: "€89.99" }
      ];
      
      const newMessage: Message = {
        id: nanoid(),
        text: `I'd like to cancel my ${contractType} contract.`,
        sender: isAgentMode ? 'agent' : 'customer',
        timestamp: new Date(),
        cancellation: {
          type: contractType,
          contracts: contracts,
          requiresVerification: true
        }
      };
      
      setMessages(prev => [...prev, newMessage]);
      onProcessSelection('show_contracts_for_cancellation');
    }
    else {
      // Standard response handling
      const newMessage: Message = {
        id: nanoid(),
        text: response,
        sender: isAgentMode ? 'agent' : 'customer',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      
      // Process the selection
      onProcessSelection(response);
    }
    
    // Scroll to bottom after selection
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [callActive, isAgentMode, onProcessSelection]);

  // Handle accepting a suggestion
  const handleAcceptSuggestion = useCallback((messageId: string, suggestionId: string) => {
    setMessages(prev => 
      prev.map(message => {
        if (message.id === messageId && message.suggestions) {
          return {
            ...message,
            suggestions: message.suggestions.map(suggestion => 
              suggestion.id === suggestionId 
                ? { ...suggestion, accepted: true, rejected: false }
                : suggestion
            )
          };
        }
        return message;
      })
    );
  }, []);

  // Handle rejecting a suggestion
  const handleRejectSuggestion = useCallback((messageId: string) => {
    setMessages(prev => 
      prev.map(message => {
        if (message.id === messageId) {
          return { ...message, isRejected: true };
        }
        return message;
      })
    );
  }, []);

  // Toggle recording state
  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
  }, []);

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
    toggleRecording
  };
}
