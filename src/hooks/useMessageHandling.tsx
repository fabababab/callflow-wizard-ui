
import { useState, useCallback, useRef } from 'react';
import { Message } from '@/components/transcript/MessageTypes';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';
import { useSensitiveDataHandling } from '@/hooks/useSensitiveDataHandling';
import { useMessageAdders } from '@/hooks/useMessageAdders';

export function useMessageHandling() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMessageUpdate, setLastMessageUpdate] = useState<Date | null>(new Date());
  const [verificationBlocking, setVerificationBlocking] = useState(false); // We'll keep this but never use it
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get sensitive data handlers
  const {
    sensitiveDataStats,
    handleValidateSensitiveData,
    handleVerifySystemCheck
  } = useSensitiveDataHandling(messages, setMessages, () => {}, setLastMessageUpdate);
  
  // Get message adders
  const {
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    addInlineModuleMessage
  } = useMessageAdders(messages, setMessages, sensitiveDataStats, setLastMessageUpdate);

  /**
   * Clear all messages from the transcript
   */
  const clearMessages = () => {
    console.log("Clearing all messages");
    setMessages([]);
    setLastMessageUpdate(new Date());
  };

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
  };
}
