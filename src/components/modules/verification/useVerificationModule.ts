
import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { VerificationFieldData } from './VerificationFields';

export interface VerificationResult {
  verified: boolean;
  fields: {
    id: string;
    value: string;
    verified: boolean;
  }[];
  cancelled?: boolean;
}

export interface VerificationModuleHookProps {
  id: string;
  fields: any[];
  isInline?: boolean;
  onComplete?: (result: VerificationResult) => void;
}

export function useVerificationModule({
  id,
  fields,
  isInline = false,
  onComplete
}: VerificationModuleHookProps) {
  const [verificationFields, setVerificationFields] = useState<VerificationFieldData[]>(
    fields.map(field => ({
      ...field,
      // Automatically set value to expected value if provided
      value: field.expectedValue || field.value,
      verified: true
    }))
  );
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);
  const hasShownNotificationRef = useRef(false);
  const verificationCompleteRef = useRef(false);
  const moduleInstanceId = useRef<string>(`verification-${id}-${Date.now()}`).current;
  
  const { addNotification } = useNotifications();
  
  // Auto-verify on mount after a small delay
  useEffect(() => {
    if (!processingRef.current && !verificationCompleteRef.current) {
      const timeout = setTimeout(() => {
        handleVerify();
      }, 800);
      return () => clearTimeout(timeout);
    }
    
    return () => {
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current);
      }
    };
  }, []);
  
  const handleInputChange = (fieldId: string, value: string) => {
    if (processingRef.current) return;
    
    setVerificationFields(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { ...field, value, verified: true } 
          : field
      )
    );
  };
  
  const handleVerify = () => {
    // Prevent multiple verifications
    if (processingRef.current || verificationCompleteRef.current) return;
    processingRef.current = true;
    
    console.log(`Processing verification for module ${id} with instance ID ${moduleInstanceId}`);
    
    // Always succeed
    setVerificationStatus('success');
    
    // Show notification once
    if (!hasShownNotificationRef.current) {
      handleVerificationSuccess();
      hasShownNotificationRef.current = true;
    }
    
    // Mark verification as complete to prevent multiple calls
    verificationCompleteRef.current = true;
    
    // Add a slight delay to show the success state before completing
    completeTimeoutRef.current = setTimeout(() => {
      if (onComplete) {
        console.log(`VerificationModule ${id} completed with automatic success`);
        onComplete({
          verified: true,
          fields: verificationFields.map(f => ({
            id: f.id,
            value: f.value,
            verified: true
          }))
        });
        
        // Use a unique identifier for this verification event
        const eventId = `module-${id}-${moduleInstanceId}-${Date.now()}`;
        
        // Dispatch a custom event to trigger state transition after verification
        const completeEvent = new CustomEvent('verification-complete', {
          detail: { 
            success: true, 
            moduleId: id,
            instanceId: moduleInstanceId,
            eventId: eventId
          }
        });
        console.log(`Dispatching verification-complete event with ID: ${eventId}`);
        window.dispatchEvent(completeEvent);
        
        // If verification was successful and this is inline, trigger flow continuation
        // but only dispatch one event to continue the flow
        if (isInline) {
          console.log(`Verification module ${id} successful, continuing flow...`);
          
          // Dispatch an event to continue the flow
          const successEvent = new CustomEvent('verification-successful', {
            detail: { 
              moduleId: id,
              instanceId: moduleInstanceId,
              eventId: eventId 
            }
          });
          console.log(`Dispatching verification-successful event with ID: ${eventId}`);
          setTimeout(() => window.dispatchEvent(successEvent), 100);
        }
        
        // Reset processing state after a longer delay to prevent rapid re-renders
        setTimeout(() => {
          processingRef.current = false;
        }, 1000);
      }
    }, 1500);
  };
  
  const handleVerificationSuccess = () => {
    addNotification({
      title: "Verification Successful", 
      description: "Customer identity has been verified",
      type: "success"
    });
  };
  
  const handleVerificationFailure = () => {
    addNotification({ 
      title: "Verification Failed", 
      description: "Identity verification could not be completed",
      type: "error"
    });
  };

  return {
    verificationFields,
    verificationStatus,
    isInlineDisplay: isInline,
    processingRef,
    verificationCompleteRef,
    handleInputChange,
    handleVerify,
    handleVerificationFailure
  };
}
