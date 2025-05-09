
import { useState, useRef } from 'react';
import Message from '@/components/transcript/Message';
import { MessageType } from '@/components/transcript/Message';
import { ModuleConfig } from '@/types/modules';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';
import { useMessageAdders } from '@/hooks/useMessageAdders';
import { useSensitiveDataHandling } from '@/hooks/useSensitiveDataHandling';

export function useMessageHandling() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [lastMessageUpdate, setLastMessageUpdate] = useState<Date | null>(new Date());
  const [verificationBlocking, setVerificationBlocking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get sensitive data handlers
  const {
    sensitiveDataStats,
    handleValidateSensitiveData,
    handleVerifySystemCheck
  } = useSensitiveDataHandling(messages, setMessages, setVerificationBlocking, setLastMessageUpdate);
  
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
          
          return updatedMessage;
        }
        
        return message;
      })
    );
    
    setLastMessageUpdate(new Date());
    
    // If verification was successful, unblock the flow
    if (result?.verified === true) {
      setVerificationBlocking(false);
    }
  };

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
  };
}
