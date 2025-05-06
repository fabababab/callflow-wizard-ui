
import { useState, useCallback, useRef } from 'react';
import { Message } from '@/components/transcript/Message';
import { ValidationStatus } from '@/data/scenarioData';
import { v4 as uuidv4 } from 'uuid';

// Define types for sensitive data stats
interface SensitiveDataStats {
  valid: number;
  invalid: number;
  pending: number;
  total: number;
}

export function useMessageHandling() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [verificationBlocking, setVerificationBlocking] = useState(false);
  const [lastMessageUpdate, setLastMessageUpdate] = useState<Date | null>(null);
  const messageIdCounter = useRef(0);
  
  // Initial stats state
  const [sensitiveDataStats, setSensitiveDataStats] = useState<SensitiveDataStats>({
    valid: 0,
    invalid: 0,
    pending: 0,
    total: 0
  });

  // Update stats whenever a sensitive field is validated
  const updateSensitiveDataStats = useCallback(() => {
    let valid = 0;
    let invalid = 0;
    let pending = 0;
    let total = 0;

    messages.forEach(message => {
      if (message.sensitiveData) {
        message.sensitiveData.forEach(field => {
          total++;
          if (field.status === 'valid') valid++;
          else if (field.status === 'invalid') invalid++;
          else pending++;
        });
      }
    });

    setSensitiveDataStats({ valid, invalid, pending, total });
  }, [messages]);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    messageIdCounter.current = 0;
    setLastMessageUpdate(new Date());
  }, []);

  // Add a system message
  const addSystemMessage = useCallback((text: string, requiresVerification?: boolean) => {
    // Special case for "customer explains their problem" messages
    if (text === "The customer explains their problem." && 
        messages.length > 0 && 
        messages[messages.length - 1].text === "Call initiated with customer.") {
      
      // We don't add this as a system message - it will be handled by addCustomerMessage
      console.log("Skipping system message for customer explanation, will be handled separately");
      return;
    }
    
    const newMessage: Message = {
      id: messageIdCounter.current.toString(),
      text,
      sender: 'system',
      timestamp: new Date(),
      requiresVerification,
      isVerified: false,
    };
    
    messageIdCounter.current += 1;
    setMessages(prev => [...prev, newMessage]);
    setLastMessageUpdate(new Date());
    
    console.log("Adding system message:", text);
    
    if (requiresVerification) {
      setVerificationBlocking(true);
    }
  }, [messages]);

  // Add a customer message
  const addCustomerMessage = useCallback((text: string, suggestions: string[] = []) => {
    const newMessage: Message = {
      id: messageIdCounter.current.toString(),
      text,
      sender: 'customer',
      timestamp: new Date(),
      suggestions,
    };
    
    messageIdCounter.current += 1;
    setMessages(prev => [...prev, newMessage]);
    setLastMessageUpdate(new Date());
    
    console.log("Adding customer message:", text);
  }, []);

  // Add an agent message
  const addAgentMessage = useCallback((text: string, suggestions: string[] = []) => {
    const newMessage: Message = {
      id: messageIdCounter.current.toString(),
      text,
      sender: 'agent',
      timestamp: new Date(),
      suggestions,
    };
    
    messageIdCounter.current += 1;
    setMessages(prev => [...prev, newMessage]);
    setLastMessageUpdate(new Date());
  }, []);

  // Verify a system check
  const handleVerifySystemCheck = useCallback((messageId: string) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, isVerified: true }
          : message
      )
    );
    setVerificationBlocking(false);
  }, []);

  // Validate sensitive data
  const handleValidateSensitiveData = useCallback((messageId: string, fieldId: string, status: ValidationStatus, notes?: string) => {
    setMessages(prev => 
      prev.map(message => {
        if (message.id === messageId && message.sensitiveData) {
          return {
            ...message,
            sensitiveData: message.sensitiveData.map(field =>
              field.id === fieldId
                ? { ...field, status, notes: notes || field.notes }
                : field
            )
          };
        }
        return message;
      })
    );
    
    // Update stats after validation
    setTimeout(updateSensitiveDataStats, 0);
  }, [updateSensitiveDataStats]);

  return {
    messages,
    sensitiveDataStats,
    verificationBlocking,
    lastMessageUpdate,
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    clearMessages,
    handleValidateSensitiveData,
    handleVerifySystemCheck,
    setVerificationBlocking
  };
}
