
import { useState, useCallback, useRef } from 'react';
import { Message, MessageSender } from '@/components/transcript/MessageTypes';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';
import { useSensitiveDataHandling } from '@/hooks/useSensitiveDataHandling';
import { nanoid } from 'nanoid';
import { ModuleConfig } from '@/types/modules';
import { useMessageAdders } from '@/hooks/useMessageAdders';

export function useMessageHandling() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMessageUpdate, setLastMessageUpdate] = useState<Date>(new Date());
  const [verificationBlocking, setVerificationBlocking] = useState(false); // We'll keep this but never use it
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize sensitive data stats
  const initialSensitiveDataStats = {
    total: 0,
    valid: 0,
    invalid: 0
  };
  const [sensitiveDataStats, setSensitiveDataStats] = useState(initialSensitiveDataStats);
  
  // Get sensitive data handlers - make sure it returns all required functions
  const {
    sensitiveDataStats: hookSensitiveDataStats,
    handleValidateSensitiveData,
    handleVerifySystemCheck,
    isVerifying
  } = useSensitiveDataHandling(messages, setMessages, () => {}, setLastMessageUpdate);
  
  // Get message adders
  const {
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    addInlineModuleMessage
  } = useMessageAdders(messages, setMessages, sensitiveDataStats, setLastMessageUpdate);

  // Scan sensitive fields functionality
  const scanSensitiveFields = useCallback((text: string, messageId: string) => {
    console.log(`Scanning for sensitive data in message ${messageId}`);
    // Implementation would go here - simplified version
    return [];
  }, []);

  // Reset sensitive data stats
  const resetSensitiveDataStats = useCallback(() => {
    console.log("Resetting sensitive data stats");
    setSensitiveDataStats(initialSensitiveDataStats);
  }, [initialSensitiveDataStats]);

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
