
import { useState, useCallback } from 'react';
import { Message } from '@/components/transcript/MessageTypes';
import { ModuleConfig } from '@/types/modules';
import { SensitiveField } from '@/data/scenarioData';
import { nanoid } from 'nanoid';

export function useMessageAdders(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  sensitiveDataStats: { total: number; valid: number; invalid: number },
  setLastMessageUpdate: React.Dispatch<React.SetStateAction<Date>>
) {
  const setSensitiveDataStats = useState<{
    total: number;
    valid: number;
    invalid: number;
  }>(sensitiveDataStats)[1];

  /**
   * Add a system message to the transcript
   */
  const addSystemMessage = useCallback((text: string, options?: { responseOptions?: string[], systemType?: 'info' | 'warning' | 'error' | 'success' }) => {
    const newMessage: Message = {
      id: nanoid(),
      text,
      sender: 'system',
      timestamp: new Date(),
      systemType: options?.systemType || 'info',
      responseOptions: options?.responseOptions
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setLastMessageUpdate(new Date());
  }, [setMessages, setLastMessageUpdate]);

  /**
   * Add an agent message to the transcript
   */
  const addAgentMessage = useCallback((
    text: string, 
    suggestions: any[] = [], 
    responseOptions?: string[],
    requiresVerification?: boolean
  ) => {
    const newMessage: Message = {
      id: nanoid(),
      text,
      sender: 'agent',
      timestamp: new Date(),
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      responseOptions,
      requiresVerification
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setLastMessageUpdate(new Date());
  }, [setMessages, setLastMessageUpdate]);

  /**
   * Add a customer message to the transcript
   */
  const addCustomerMessage = useCallback((
    text: string, 
    sensitiveData?: SensitiveField[], 
    responseOptions?: string[],
    requiresVerification?: boolean
  ) => {
    const newMessage: Message = {
      id: nanoid(),
      text,
      sender: 'customer',
      timestamp: new Date(),
      sensitiveData,
      responseOptions,
      requiresVerification
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
  }, [setMessages, setLastMessageUpdate, setSensitiveDataStats]);

  /**
   * Add an inline module message
   */
  const addInlineModuleMessage = useCallback((text: string, moduleConfig: ModuleConfig) => {
    const newMessage: Message = {
      id: nanoid(),
      text,
      sender: 'system',
      timestamp: new Date(),
      systemType: 'info',
      inlineModule: moduleConfig
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setLastMessageUpdate(new Date());
  }, [setMessages, setLastMessageUpdate]);

  return {
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    addInlineModuleMessage
  };
}
