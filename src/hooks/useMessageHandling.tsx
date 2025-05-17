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
  
  // Add message deduplication tracking
  const processedMessageKeys = useRef<Set<string>>(new Set());
  
  // Get sensitive data handlers
  const {
    sensitiveDataStats,
    handleValidateSensitiveData,
    handleVerifySystemCheck
  } = useSensitiveDataHandling(messages, setMessages, () => {}, setLastMessageUpdate);
  
  // Create a wrapper around the message adders that includes deduplication logic
  const messageAdders = useMessageAdders(messages, (newMessages) => {
    // Check for duplicates before setting messages
    const filteredMessages = newMessages.filter(message => {
      // Create a unique key for each message based on text and stateId
      const messageKey = `${message.stateId || ''}-${message.text.substring(0, 50)}`;
      
      // If we've already processed this message, filter it out
      if (processedMessageKeys.current.has(messageKey)) {
        console.log(`Filtering out duplicate message: ${messageKey}`);
        return false;
      }
      
      // Otherwise, add it to our tracking set and keep it
      processedMessageKeys.current.add(messageKey);
      return true;
    });
    
    setMessages(filteredMessages);
  }, sensitiveDataStats, setLastMessageUpdate);
  
  // Create enhanced versions of the message adder functions that include stateId
  const addSystemMessage = useCallback((text: string, options?: { responseOptions?: string[] }) => {
    messageAdders.addSystemMessage(text, options);
  }, [messageAdders]);
  
  const addAgentMessage = useCallback((
    text: string, 
    suggestions: any[] = [], 
    responseOptions?: string[],
    requiresVerification?: boolean,
    stateId?: string
  ) => {
    messageAdders.addAgentMessage(text, suggestions, responseOptions, requiresVerification, stateId);
  }, [messageAdders]);
  
  const addCustomerMessage = useCallback((
    text: string, 
    sensitiveData?: SensitiveField[], 
    responseOptions?: string[],
    requiresVerification?: boolean,
    stateId?: string
  ) => {
    messageAdders.addCustomerMessage(text, sensitiveData, responseOptions, requiresVerification, stateId);
  }, [messageAdders]);
  
  const addInlineModuleMessage = useCallback((text: string, moduleConfig: any, stateId?: string) => {
    messageAdders.addInlineModuleMessage(text, moduleConfig, stateId);
  }, [messageAdders]);
  
  /**
   * Clear all messages from the transcript
   */
  const clearMessages = useCallback(() => {
    console.log("Clearing all messages");
    setMessages([]);
    processedMessageKeys.current.clear(); // Clear message tracking set
    setLastMessageUpdate(new Date());
  }, []);

  /**
   * Handle inline module completion
   */
  const handleInlineModuleComplete = useCallback((messageId: string, moduleId: string, result: any) => {
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
  }, []);

  // Override the original handleVerifySystemCheck to ensure verificationBlocking is never true
  const enhancedHandleVerifySystemCheck = useCallback((messageId: string) => {
    console.log(`Enhanced verification check for message ${messageId} - blocking disabled`);
    handleVerifySystemCheck(messageId);
  }, [handleVerifySystemCheck]);

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
