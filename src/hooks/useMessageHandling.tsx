
import { useState, useRef, useCallback, useEffect } from 'react';
import { Message, MessageSender } from '@/components/transcript/Message';
import { AISuggestion } from '@/components/transcript/AISuggestion';
import { useToast } from '@/hooks/use-toast';
import { StateMachineState } from '@/utils/stateMachineLoader';

interface UseMessageHandlingProps {
  stateData: StateMachineState | null;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Reset messages when call status changes
  useEffect(() => {
    if (!callActive) {
      setMessages([]);
      setInputValue('');
    }
  }, [callActive]);

  // Add initial agent message from state machine
  const addInitialAgentMessage = useCallback(() => {
    if (!stateData || !callActive) return;
    
    const initialAgentMessage = stateData.agent || "Guten Tag, wie kann ich Ihnen helfen?";
    
    const initialMessage: Message = {
      id: Date.now(),
      text: initialAgentMessage,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([initialMessage]);
    
    // Add customer response after a delay
    setTimeout(() => {
      addCustomerResponse();
    }, 1500);
  }, [stateData, callActive]);

  // Add customer response from state machine
  const addCustomerResponse = useCallback(() => {
    if (!stateData || !callActive) return;
    
    const customerText = stateData.customer || "Guten Tag, ich brauche Hilfe.";
    let suggestions: AISuggestion[] = [];
    
    // Add system message as info suggestion if available
    if (stateData.systemMessage) {
      suggestions.push({
        id: Date.now(),
        text: stateData.systemMessage,
        type: 'info'
      });
    }
    
    // Add action suggestion if available
    if (stateData.action) {
      suggestions.push({
        id: Date.now() + 1,
        text: `Aktion ausführen: ${stateData.action}`,
        type: 'action'
      });
    }
    
    // Add response suggestions if available
    if (stateData.suggestions && stateData.suggestions.length > 0) {
      stateData.suggestions.forEach((suggestion, index) => {
        suggestions.push({
          id: Date.now() + 10 + index,
          text: suggestion,
          type: 'response'
        });
      });
    }
    
    const responseOptions = stateData.suggestions || [];
    
    const customerMessage: Message = {
      id: Date.now() + 100,
      text: customerText,
      sender: 'customer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      responseOptions: responseOptions.length > 0 ? responseOptions : undefined
    };
    
    setMessages(prev => [...prev, customerMessage]);
  }, [stateData, callActive]);

  // Handle sending a message
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || !callActive) return;
    
    const newMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Trigger the state machine transition
    onDefaultTransition();
    
    // Customer will respond after the state transition effect updates the stateData
  }, [inputValue, callActive, onDefaultTransition]);

  // Handle selecting a predefined response
  const handleSelectResponse = useCallback((selectedResponse: string) => {
    if (!callActive) return;
    
    // Set the input value to the selected response
    setInputValue(selectedResponse);
    
    // Automatically send the message
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now(),
        text: selectedResponse,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
      
      // Trigger the state machine transition with this specific option
      onProcessSelection(selectedResponse);
      
      // Customer will respond after the state transition effect updates the stateData
    }, 100);
  }, [callActive, onProcessSelection]);

  // Add customer response when state data changes
  useEffect(() => {
    // Only add customer response if we have messages and the latest message is from the agent
    if (callActive && stateData && messages.length > 0 && messages[messages.length - 1].sender === 'agent') {
      setTimeout(() => {
        addCustomerResponse();
      }, 1500);
    }
  }, [stateData, callActive, messages, addCustomerResponse]);

  // Add initial agent message when call becomes active
  useEffect(() => {
    if (callActive && stateData && messages.length === 0) {
      setTimeout(() => {
        addInitialAgentMessage();
      }, 1000);
    }
  }, [callActive, stateData, messages.length, addInitialAgentMessage]);

  // Handle accepting a suggestion
  const handleAcceptSuggestion = useCallback((suggestionId: number, parentMessageId: number) => {
    // Find the suggestion
    const parentMessage = messages.find(m => m.id === parentMessageId);
    if (!parentMessage || !parentMessage.suggestions) return;
    
    const suggestion = parentMessage.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    // Mark the suggestion as accepted
    const updatedMessages = messages.map(message => {
      if (message.id === parentMessageId && message.suggestions) {
        return {
          ...message,
          suggestions: message.suggestions.map(s => 
            s.id === suggestionId 
              ? { ...s, accepted: true, rejected: false }
              : s
          )
        };
      }
      return message;
    });
    
    setMessages(updatedMessages);
    
    // If it's a response suggestion, fill the input field
    if (suggestion.type === 'response') {
      setInputValue(suggestion.text);
    }
    
    // If it's an action suggestion, show a toast and perform the action
    if (suggestion.type === 'action') {
      toast({
        title: "Action triggered",
        description: `Executing: ${suggestion.text}`,
      });
      
      // Simulate performing the action
      if (suggestion.text.includes("Bankdatenformular")) {
        // Simulate opening a bank details form
        window.dispatchEvent(new CustomEvent('open-bank-form'));
      } else if (suggestion.text.includes("Identitätsprüfung")) {
        // Simulate starting identity verification
        window.dispatchEvent(new CustomEvent('start-identity-verification'));
      } else if (suggestion.text.includes("prüfe") || suggestion.text.includes("Aktion")) {
        // Simulate looking up data
        toast({
          title: "System Action",
          description: "Performing data lookup...",
        });
        setTimeout(() => {
          toast({
            title: "Data Verification Complete",
            description: "Customer data verified successfully.",
          });
        }, 1500);
      }
      
      // Trigger the default transition for this state
      setTimeout(() => {
        onDefaultTransition();
      }, 1000);
    }
    
    toast({
      title: "Suggestion accepted",
      description: "The AI suggestion has been applied.",
    });
  }, [messages, toast, onDefaultTransition]);

  // Handle rejecting a suggestion
  const handleRejectSuggestion = useCallback((suggestionId: number, parentMessageId: number) => {
    // Mark the suggestion as rejected
    const updatedMessages = messages.map(message => {
      if (message.id === parentMessageId && message.suggestions) {
        return {
          ...message,
          suggestions: message.suggestions.map(s => 
            s.id === suggestionId 
              ? { ...s, rejected: true, accepted: false }
              : s
          )
        };
      }
      return message;
    });
    
    setMessages(updatedMessages);
    
    toast({
      title: "Suggestion rejected",
      description: "The AI suggestion has been dismissed.",
    });
  }, [messages, toast]);

  // Toggle recording state
  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording);
  }, [isRecording]);

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
