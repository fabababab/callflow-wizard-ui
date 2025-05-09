
import { useState, useCallback, useRef } from 'react';
import { Message } from '@/components/transcript/Message';
import { ValidationStatus } from '@/data/scenarioData';
import { v4 as uuidv4 } from 'uuid';
import { AISuggestion } from '@/components/transcript/AISuggestion';
import { ModuleConfig } from '@/types/modules';

// Define types for sensitive data stats
interface SensitiveDataStats {
  valid: number;
  invalid: number;
  pending: number;
  total: number;
}

// New interface for system message options
interface SystemMessageOptions {
  requiresVerification?: boolean;
  responseOptions?: string[];
  inlineModule?: ModuleConfig;
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

  // Add a system message - Updated to accept options object instead of multiple args
  const addSystemMessage = useCallback((text: string, options?: SystemMessageOptions) => {
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
      requiresVerification: options?.requiresVerification,
      isVerified: false,
      responseOptions: options?.responseOptions,
      inlineModule: options?.inlineModule
    };
    
    messageIdCounter.current += 1;
    setMessages(prev => [...prev, newMessage]);
    setLastMessageUpdate(new Date());
    
    console.log("Adding system message:", text);
    
    if (options?.requiresVerification) {
      setVerificationBlocking(true);
    }
  }, [messages]);

  // Add a customer message
  const addCustomerMessage = useCallback((text: string, suggestions: string[] = []) => {
    // Convert string suggestions to AISuggestion objects if provided
    const aiSuggestions: AISuggestion[] = suggestions.map((suggestion, index) => ({
      id: index.toString(),
      text: suggestion,
      type: 'response'
    }));
    
    const newMessage: Message = {
      id: messageIdCounter.current.toString(),
      text,
      sender: 'customer',
      timestamp: new Date(),
      suggestions: aiSuggestions,
    };
    
    messageIdCounter.current += 1;
    setMessages(prev => [...prev, newMessage]);
    setLastMessageUpdate(new Date());
    
    console.log("Adding customer message:", text);
  }, []);

  // Add an agent message
  const addAgentMessage = useCallback((text: string, suggestions: string[] = [], responseOptions?: string[]) => {
    // Convert string suggestions to AISuggestion objects if provided
    const aiSuggestions: AISuggestion[] = suggestions.map((suggestion, index) => ({
      id: index.toString(),
      text: suggestion,
      type: 'response'
    }));
    
    const newMessage: Message = {
      id: messageIdCounter.current.toString(),
      text,
      sender: 'agent',
      timestamp: new Date(),
      suggestions: aiSuggestions,
      responseOptions
    };
    
    messageIdCounter.current += 1;
    setMessages(prev => [...prev, newMessage]);
    setLastMessageUpdate(new Date());
  }, []);

  // Add a system message with an inline module
  const addInlineModuleMessage = useCallback((text: string, moduleConfig: ModuleConfig) => {
    const newMessage: Message = {
      id: messageIdCounter.current.toString(),
      text,
      sender: 'system',
      timestamp: new Date(),
      inlineModule: moduleConfig
    };
    
    messageIdCounter.current += 1;
    setMessages(prev => [...prev, newMessage]);
    setLastMessageUpdate(new Date());
    
    console.log("Adding inline module message:", text, moduleConfig);
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

  // Handle completion of an inline module
  const handleInlineModuleComplete = useCallback((messageId: string, moduleId: string, result: any) => {
    console.log(`Inline module ${moduleId} completed for message ${messageId}:`, result);
    
    // Could update the message to reflect completion if needed
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { 
              ...message,
              inlineModule: message.inlineModule ? {
                ...message.inlineModule,
                completed: true,
                result
              } : undefined
            }
          : message
      )
    );
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
    addInlineModuleMessage,
    clearMessages,
    handleValidateSensitiveData,
    handleVerifySystemCheck,
    handleInlineModuleComplete,
    setVerificationBlocking
  };
}
