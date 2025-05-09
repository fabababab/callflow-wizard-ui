
import { useState, useCallback, useRef } from 'react';
import { Message } from '@/components/transcript/MessageTypes';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';

export function useSensitiveDataHandling(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setVerificationBlocking: React.Dispatch<React.SetStateAction<boolean>>,
  setLastMessageUpdate: React.Dispatch<React.SetStateAction<Date | null>>
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
  
  // Track if we're currently performing a verification
  const [isVerifying, setIsVerifying] = useState(false);
  const lastVerifyTimeRef = useRef<number>(0);
  const processingRef = useRef<boolean>(false);

  /**
   * Handle validation of sensitive data
   */
  const handleValidateSensitiveData = useCallback((
    messageId: string, 
    fieldId: string, 
    status: ValidationStatus, 
    notes?: string
  ) => {
    // Prevent multiple validation calls in quick succession
    const now = Date.now();
    if (isVerifying || now - lastVerifyTimeRef.current < 1500 || processingRef.current) return;
    
    processingRef.current = true;
    setIsVerifying(true);
    lastVerifyTimeRef.current = now;
    
    console.log(`Validating sensitive field ${fieldId} in message ${messageId} with status: ${status}`);
    
    // Use batch updates to minimize re-renders
    setTimeout(() => {
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
              } as SensitiveField;
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
      }
      
      // Use a longer delay before allowing new verifications to prevent flickering
      setTimeout(() => {
        setIsVerifying(false);
        processingRef.current = false;
      }, 1500);
      
      // Delay the message update notification to avoid rapid UI changes
      setTimeout(() => {
        setLastMessageUpdate(new Date());
      }, 100);
    }, 50);
  }, [setMessages, setLastMessageUpdate, isVerifying]);

  /**
   * Handle verification of system checks - No auto verification
   */
  const handleVerifySystemCheck = useCallback((messageId: string) => {
    // Prevent multiple verification calls in quick succession
    const now = Date.now();
    if (isVerifying || now - lastVerifyTimeRef.current < 1500 || processingRef.current) return;
    
    processingRef.current = true;
    setIsVerifying(true);
    lastVerifyTimeRef.current = now;
    
    console.log(`Verifying system check for message ${messageId} - inline only, no modals`);
    
    // Make sure verification blocking is set to false to avoid modals
    setVerificationBlocking(false);
    
    // Delay the state update to prevent rapid re-renders
    setTimeout(() => {
      setMessages(prevMessages =>
        prevMessages.map(message => {
          if (message.id !== messageId) return message;
          
          return {
            ...message,
            isVerified: true,
          };
        })
      );
      
      // Reset verifying state after a longer delay
      setTimeout(() => {
        setIsVerifying(false);
        processingRef.current = false;
        
        // Delay notification of message update to batch UI updates
        setTimeout(() => {
          setLastMessageUpdate(new Date());
        }, 100);
      }, 1500);
    }, 50);
  }, [setMessages, setLastMessageUpdate, setVerificationBlocking, isVerifying]);

  return {
    sensitiveDataStats,
    handleValidateSensitiveData,
    handleVerifySystemCheck,
    isVerifying
  };
}
