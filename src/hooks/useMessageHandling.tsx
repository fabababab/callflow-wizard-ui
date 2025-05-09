
import { useState, useRef } from 'react';
import { Message } from '@/components/transcript/Message';
import { ModuleConfig } from '@/types/modules';
import { SensitiveField } from '@/data/scenarioData';

export function useMessageHandling() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sensitiveDataStats, setSensitiveDataStats] = useState<{
    total: number;
    valid: number;
    invalid: number;
  }>({
    total: 0,
    valid: 0,
    invalid: 0,
  });
  const [verificationBlocking, setVerificationBlocking] = useState(false);
  const [lastMessageUpdate, setLastMessageUpdate] = useState<Date>(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Add a system message to the transcript
   */
  const addSystemMessage = (text: string, options?: { responseOptions?: string[] }) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'system',
      timestamp: new Date(),
      systemType: 'info',
      responseOptions: options?.responseOptions
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setLastMessageUpdate(new Date());
  };

  /**
   * Add an agent message to the transcript
   */
  const addAgentMessage = (
    text: string, 
    suggestions: any[] = [], 
    responseOptions?: string[]
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'agent',
      timestamp: new Date(),
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      responseOptions
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setLastMessageUpdate(new Date());
  };

  /**
   * Add a customer message to the transcript
   */
  const addCustomerMessage = (
    text: string, 
    sensitiveData?: SensitiveField[], 
    responseOptions?: string[]
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'customer',
      timestamp: new Date(),
      sensitiveData,
      responseOptions
    };

    // Update aggregate stats for sensitive data
    if (sensitiveData && sensitiveData.length > 0) {
      setSensitiveDataStats(prev => ({
        ...prev,
        total: prev.total + sensitiveData.length
      }));
    }

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setLastMessageUpdate(new Date());
  };

  /**
   * Add an inline module message
   */
  const addInlineModuleMessage = (text: string, moduleConfig: ModuleConfig) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'system',
      timestamp: new Date(),
      systemType: 'info',
      inlineModule: moduleConfig
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setLastMessageUpdate(new Date());
  };

  /**
   * Clear all messages from the transcript
   */
  const clearMessages = () => {
    setMessages([]);
    setSensitiveDataStats({
      total: 0,
      valid: 0,
      invalid: 0,
    });
    setLastMessageUpdate(new Date());
  };

  /**
   * Handle validation of sensitive data
   */
  const handleValidateSensitiveData = (messageId: string, fieldId: string, status: string, notes?: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => {
        if (message.id !== messageId || !message.sensitiveData) return message;
        
        // Find and update the specific field
        const updatedSensitiveData = message.sensitiveData.map(field => {
          if (field.id === fieldId) {
            return {
              ...field,
              status,
              notes,
            };
          }
          return field;
        });
        
        return {
          ...message,
          sensitiveData: updatedSensitiveData,
        };
      })
    );
    
    // Update aggregate stats
    if (status === 'valid') {
      setSensitiveDataStats(prev => ({
        ...prev,
        valid: prev.valid + 1,
      }));
    } else if (status === 'invalid') {
      setSensitiveDataStats(prev => ({
        ...prev,
        invalid: prev.invalid + 1,
      }));
      
      // Set verification blocking if any sensitive data is invalid
      setVerificationBlocking(true);
    }
    
    setLastMessageUpdate(new Date());
  };

  /**
   * Handle verification of system checks
   */
  const handleVerifySystemCheck = (messageId: string) => {
    setMessages(prevMessages =>
      prevMessages.map(message => {
        if (message.id !== messageId) return message;
        
        return {
          ...message,
          isVerified: true,
        };
      })
    );
    
    // Clear verification blocking
    setVerificationBlocking(false);
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
            }
          };
          
          return updatedMessage;
        }
        
        return message;
      })
    );
    
    setLastMessageUpdate(new Date());
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
