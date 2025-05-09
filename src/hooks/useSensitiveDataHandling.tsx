
import { useState, useCallback } from 'react';
import Message from '@/components/transcript/Message';
import { MessageType } from '@/components/transcript/Message';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';

export function useSensitiveDataHandling(
  messages: MessageType[],
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>,
  setVerificationBlocking: React.Dispatch<React.SetStateAction<boolean>>,
  setLastMessageUpdate: React.Dispatch<React.SetStateAction<Date>>
) {
  const [sensitiveDataStats, setSensitiveDataStats] = useState<{
    total: number;
    valid: number;
    invalid: number;
  }>({
    total: 0,
    valid: 0,
    invalid: 0,
  });

  /**
   * Handle validation of sensitive data
   */
  const handleValidateSensitiveData = useCallback((
    messageId: string, 
    fieldId: string, 
    status: ValidationStatus, 
    notes?: string
  ) => {
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
            } as SensitiveField; // Cast to ensure type compatibility
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
  }, [setMessages, setLastMessageUpdate, setVerificationBlocking]);

  /**
   * Handle verification of system checks
   */
  const handleVerifySystemCheck = useCallback((messageId: string) => {
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
  }, [setMessages, setLastMessageUpdate, setVerificationBlocking]);

  return {
    sensitiveDataStats,
    handleValidateSensitiveData,
    handleVerifySystemCheck
  };
}
