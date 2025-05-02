
import { useState, useRef, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/transcript/Message';
import { AISuggestion } from '@/components/transcript/AISuggestion';

interface MessageHandlingProps {
  stateData: any;
  onProcessSelection: (selection: string) => boolean;
  onDefaultTransition: () => boolean;
  callActive: boolean;
}

export function useMessageHandling({
  stateData,
  onProcessSelection,
  onDefaultTransition,
  callActive
}: MessageHandlingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Send a message from the user
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || !callActive) return;

    const newMessage: Message = {
      id: nanoid(),
      text: inputValue,
      sender: 'customer',
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
  }, [inputValue, callActive, onProcessSelection]);

  // Handle selecting a response option
  const handleSelectResponse = useCallback((response: string) => {
    if (!callActive) return;
    
    const newMessage: Message = {
      id: nanoid(),
      text: response,
      sender: 'customer',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Process the selection
    onProcessSelection(response);
    
    // Scroll to bottom after selection
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [callActive, onProcessSelection]);

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
