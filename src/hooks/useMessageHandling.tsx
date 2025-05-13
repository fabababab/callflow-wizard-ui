import { useState, useCallback, useRef } from 'react';
import { Message, MessageSender } from '@/components/transcript/MessageTypes';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';
import { useSensitiveDataHandling } from '@/hooks/useSensitiveDataHandling';
import { nanoid } from 'nanoid';
import { ModuleConfig } from '@/types/modules';

export function useMessageHandling() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMessageUpdate, setLastMessageUpdate] = useState<Date>(new Date());
  const [verificationBlocking, setVerificationBlocking] = useState(false); // We'll keep this but never use it
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get sensitive data handlers
  const {
    sensitiveDataStats,
    handleValidateSensitiveData,
    handleVerifySystemCheck,
    resetSensitiveDataStats,
    scanSensitiveFields
  } = useSensitiveDataHandling(messages, setMessages, () => {}, setLastMessageUpdate);
  
  // Get message adders
  const {
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    addInlineModuleMessage
  } = useMessageAdders(messages, setMessages, sensitiveDataStats, setLastMessageUpdate);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: nanoid(),
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setLastMessageUpdate(new Date());
    // Scan for sensitive data if it's a customer message
    if (newMessage.sender === 'customer' && newMessage.text) {
      scanSensitiveFields(newMessage.text, newMessage.id);
    }
  }, [scanSensitiveFields]);

  const addSystemMessage = useCallback((text: string, options?: { responseOptions?: string[], systemType?: 'info' | 'warning' | 'error' | 'success' }) => {
    // Deduplication check
    const isDuplicate = messages.some(msg => 
      msg.sender === 'system' && 
      msg.text === text && 
      Date.now() - (msg.timestamp instanceof Date ? msg.timestamp.getTime() : new Date(msg.timestamp).getTime()) < 2000
    );
    if (isDuplicate) {
      console.warn('[DEDUPLICATION] Prevented duplicate system message:', text);
      return;
    }
    addMessage({
      text,
      sender: 'system',
      systemType: options?.systemType || 'info',
      responseOptions: options?.responseOptions,
    });
  }, [addMessage, messages]);

  const addAgentMessage = useCallback((text: string, suggestions?: any[], responseOptions?: string[], requiresVerification?: boolean) => {
    addMessage({
      text,
      sender: 'agent',
      suggestions: suggestions || [],
      responseOptions: responseOptions || [],
      requiresVerification: requiresVerification || false,
    });
  }, [addMessage]);

  const addCustomerMessage = useCallback((text: string, sensitiveData?: SensitiveField[], responseOptions?: string[], requiresVerification?: boolean) => {
    addMessage({
      text,
      sender: 'customer',
      sensitiveData: sensitiveData || [],
      responseOptions: responseOptions || [],
      requiresVerification: requiresVerification || false,
    });
  }, [addMessage]);

  const addInlineModuleMessage = useCallback((text: string, moduleConfig: ModuleConfig) => {
    addMessage({
      text,
      sender: 'system', // Or 'agent' depending on desired appearance
      inlineModule: moduleConfig,
      systemType: 'info'
    });
  }, [addMessage]);

  /**
   * Clear all messages from the transcript
   */
  const clearMessages = useCallback(() => {
    console.log("Clearing all messages");
    setMessages([]);
    setLastMessageUpdate(new Date());
    resetSensitiveDataStats(); // Reset sensitive data stats when clearing messages
  }, [resetSensitiveDataStats]);

  /**
   * Handle inline module completion
   */
  const handleInlineModuleComplete = (messageId: string, moduleId: string, result: any) => {
    console.log(`Inline module ${moduleId} completed for message ${messageId} with result:`, result);
    
    setMessages(prevMessages =>
      prevMessages.map(message => {
        if (message.id !== messageId) return message;
        
        // Mark the module as completed in some way
        if (message.inlineModule && message.inlineModule.id === moduleId) {
          const updatedMessage = {
            ...message,
            inlineModule: {
              ...message.inlineModule,
              completed: true,
              result
            },
            isVerified: result?.verified === true
          };
          
          console.log(`Updated message with completed inline module:`, updatedMessage);
          return updatedMessage;
        }
        
        return message;
      })
    );
    
    setLastMessageUpdate(new Date());
  };

  // Override the original handleVerifySystemCheck to ensure verificationBlocking is never true
  const enhancedHandleVerifySystemCheck = (messageId: string) => {
    console.log(`Enhanced verification check for message ${messageId} - blocking disabled`);
    handleVerifySystemCheck(messageId);
  };

  return {
    messages,
    sensitiveDataStats,
    verificationBlocking: false, // Always return false to disable blocking
    lastMessageUpdate,
    messagesEndRef,
    addMessage,
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    addInlineModuleMessage,
    clearMessages,
    handleValidateSensitiveData,
    handleVerifySystemCheck: enhancedHandleVerifySystemCheck,
    handleInlineModuleComplete,
    setVerificationBlocking: () => {
      console.log("Verification blocking disabled - no-op function called");
    }, // No-op function
    scanSensitiveFields,
    resetSensitiveDataStats
  };
}
