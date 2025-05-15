
import { useState, useCallback, useRef } from 'react';
import { Message } from '@/components/transcript/MessageTypes';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';
import { useSensitiveDataHandling } from '@/hooks/useSensitiveDataHandling';
import { useMessageAdders } from '@/hooks/useMessageAdders';

export function useMessageHandling() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMessageUpdate, setLastMessageUpdate] = useState<Date | null>(new Date());
  const [verificationBlocking, setVerificationBlocking] = useState(false);
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
  const clearMessages = useCallback(() => {
    console.log("Clearing all messages");
    setMessages([]);
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

  // Function to update message with module result
  const updateMessageModuleResult = useCallback((messageId: string, moduleId: string, result: any) => {
    handleInlineModuleComplete(messageId, moduleId, result);
  }, [handleInlineModuleComplete]);

  // Function to update a sensitive field
  const updateSensitiveField = useCallback((fieldId: string, status: ValidationStatus, notes?: string) => {
    console.log(`Updating sensitive field ${fieldId} with status ${status}`);
    
    setMessages(prevMessages => {
      return prevMessages.map(message => {
        if (!message.sensitiveData) return message;
        
        const updatedSensitiveData = message.sensitiveData.map(field => {
          if (field.id === fieldId) {
            return {
              ...field,
              validationStatus: status,
              notes
            };
          }
          return field;
        });
        
        return {
          ...message,
          sensitiveData: updatedSensitiveData
        };
      });
    });
    
    setLastMessageUpdate(new Date());
  }, []);

  return {
    messages,
    sensitiveDataStats,
    verificationBlocking,
    lastMessageUpdate,
    messagesEndRef,
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    addInlineModuleMessage,
    clearMessages,
    handleValidateSensitiveData,
    handleVerifySystemCheck, 
    handleInlineModuleComplete,
    setVerificationBlocking,
    updateMessageModuleResult,
    updateSensitiveField
  };
}
