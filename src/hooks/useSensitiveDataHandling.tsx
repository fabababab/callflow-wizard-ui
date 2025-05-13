
import { useState, useCallback, useRef } from 'react';
import { Message } from '@/components/transcript/MessageTypes';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';
import { useToast } from '@/hooks/use-toast';

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
  
  const { toast } = useToast();
  
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
    status: ValidationStatus = 'verified', // Default to verified
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
                status: 'verified' as ValidationStatus, // Always mark as verified
                notes,
              };
            }
            return field;
          });
          
          return {
            ...message,
            sensitiveData: updatedSensitiveData,
            isVerified: true, // Always mark the message as verified
          };
        })
      );
      
      // Always increase valid count
      setSensitiveDataStats(prev => ({
        ...prev,
        valid: prev.valid + 1,
      }));
      
      // Show success toast
      toast({
        title: "Field Validated",
        description: "Sensitive information has been validated",
        duration: 1500
      });
      
      // Use a longer delay before allowing new verifications to prevent flickering
      setTimeout(() => {
        setIsVerifying(false);
        processingRef.current = false;
      }, 1000);
      
      // Delay the message update notification to avoid rapid UI changes
      setTimeout(() => {
        setLastMessageUpdate(new Date());
      }, 100);
    }, 50);
  }, [setMessages, setLastMessageUpdate, isVerifying, toast]);

  /**
   * Handle verification of system checks - Always auto verify
   */
  const handleVerifySystemCheck = useCallback((messageId: string) => {
    // Prevent multiple verification calls in quick succession
    const now = Date.now();
    if (isVerifying || now - lastVerifyTimeRef.current < 1500 || processingRef.current) return;
    
    processingRef.current = true;
    setIsVerifying(true);
    lastVerifyTimeRef.current = now;
    
    console.log(`Verifying system check for message ${messageId} - auto verification enabled`);
    
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
      
      // Show success toast
      toast({
        title: "System Check Verified",
        description: "Verification completed successfully",
        duration: 1500
      });
      
      // Reset verifying state after a longer delay
      setTimeout(() => {
        setIsVerifying(false);
        processingRef.current = false;
        
        // Delay notification of message update to batch UI updates
        setTimeout(() => {
          setLastMessageUpdate(new Date());
        }, 100);
      }, 1000);
    }, 50);
  }, [setMessages, setLastMessageUpdate, setVerificationBlocking, isVerifying, toast]);

  return {
    sensitiveDataStats,
    handleValidateSensitiveData,
    handleVerifySystemCheck,
    isVerifying
  };
}
