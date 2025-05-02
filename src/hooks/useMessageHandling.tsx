
import { useState } from 'react';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';
import { detectSensitiveData, ValidationStatus, SensitiveDataType } from '@/data/scenarioData';

type SensitiveDataField = {
  id: string;
  type: SensitiveDataType; // Updated to use the SensitiveDataType enum instead of string
  value: string;
  status: ValidationStatus;
  notes?: string;
  requiresVerification?: boolean;
};

export type Message = {
  id: string;
  text: string;
  sender: 'agent' | 'customer' | 'system';
  timestamp: Date;
  responseOptions?: string[];
  sensitiveData?: SensitiveDataField[];
  requiresVerification?: boolean;
  isVerified?: boolean;
};

export function useMessageHandling() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sensitiveDataStats, setSensitiveDataStats] = useState<{
    validated: number;
    pending: number;
    invalid: number;
  }>({ validated: 0, pending: 0, invalid: 0 });
  const [verificationBlocking, setVerificationBlocking] = useState(false);
  const [lastMessageUpdate, setLastMessageUpdate] = useState<Date>(new Date());

  // Add a system message
  const addSystemMessage = (text: string, requiresVerification: boolean = false) => {
    console.log('Adding system message:', text);
    const newMessage = {
      id: nanoid(),
      text,
      sender: 'system' as const,
      timestamp: new Date(),
      requiresVerification,
      isVerified: !requiresVerification
    };
    
    setMessages(prev => [...prev, newMessage]);
    setLastMessageUpdate(new Date());
    
    if (requiresVerification) {
      setVerificationBlocking(true);
    }
    
    return newMessage;
  };

  // Add an agent message
  const addAgentMessage = (text: string, responseOptions: string[] = []) => {
    console.log('Adding agent message:', text, 'with options:', responseOptions);
    const newMessage = {
      id: nanoid(),
      text,
      sender: 'agent' as const,
      timestamp: new Date(),
      responseOptions
    };
    
    setMessages(prev => [...prev, newMessage]);
    setLastMessageUpdate(new Date());
    
    return newMessage;
  };

  // Add a customer message with sensitive data detection
  const addCustomerMessage = (text: string, responseOptions: string[] = []) => {
    console.log('Adding customer message:', text);
    // Detect sensitive data in the message
    const sensitiveData = detectSensitiveData(text);
    
    // Check if any sensitive data requires verification
    const hasVerificationRequired = sensitiveData.some(data => data.requiresVerification);
    
    // If sensitive data is found, show a toast notification
    if (sensitiveData.length > 0) {
      toast({
        title: "Sensitive Data Detected",
        description: hasVerificationRequired 
          ? `${sensitiveData.length} sensitive data fields found that require verification` 
          : `${sensitiveData.length} sensitive data fields found in message`,
        variant: hasVerificationRequired ? "destructive" : "default"
      });
      
      // Update sensitive data stats
      setSensitiveDataStats(prev => ({
        ...prev,
        pending: prev.pending + sensitiveData.length
      }));
      
      // Block progress if verification is required
      if (hasVerificationRequired) {
        setVerificationBlocking(true);
      }
    }
    
    const newMessage = {
      id: nanoid(),
      text,
      sender: 'customer' as const,
      timestamp: new Date(),
      responseOptions,
      sensitiveData: sensitiveData.length > 0 ? sensitiveData : undefined
    };
    
    setMessages(prev => [...prev, newMessage]);
    setLastMessageUpdate(new Date());
    
    return newMessage;
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
    setLastMessageUpdate(new Date());
    setSensitiveDataStats({ validated: 0, pending: 0, invalid: 0 });
    setVerificationBlocking(false);
  };

  // Handle validating sensitive data
  const handleValidateSensitiveData = (messageId: string, fieldId: string, status: ValidationStatus, notes?: string) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId && message.sensitiveData) {
        const updatedFields = message.sensitiveData.map(field => {
          if (field.id === fieldId) {
            const previousStatus = field.status;
            
            // Update stats based on status change
            if (previousStatus !== status) {
              setSensitiveDataStats(stats => {
                const newStats = { ...stats };
                if (previousStatus === 'pending') newStats.pending--;
                else if (previousStatus === 'valid') newStats.validated--;
                else if (previousStatus === 'invalid') newStats.invalid--;
                
                if (status === 'pending') newStats.pending++;
                else if (status === 'valid') newStats.validated++;
                else if (status === 'invalid') newStats.invalid++;
                
                return newStats;
              });
            }
            
            // If this is a required verification field being marked as valid or invalid
            // check if we can unblock the conversation
            if (field.requiresVerification && (status === 'valid' || status === 'invalid')) {
              checkIfVerificationComplete();
            }
            
            return { ...field, status, notes };
          }
          return field;
        });
        
        return { ...message, sensitiveData: updatedFields };
      }
      return message;
    }));
    
    setLastMessageUpdate(new Date());
    
    // Show validation toast
    toast({
      title: status === 'valid' ? "Validated" : "Validation Failed",
      description: `Customer data marked as ${status}`,
      variant: status === 'valid' ? "default" : "destructive"
    });
  };
  
  // Check if all required verifications are completed
  const checkIfVerificationComplete = () => {
    // Check all messages with sensitive data that require verification
    const allVerified = messages.every(message => {
      if (!message.sensitiveData) return true;
      
      // Check if any sensitive data field requires verification but is still pending
      return !message.sensitiveData.some(field => 
        field.requiresVerification && field.status === 'pending'
      );
    });
    
    if (allVerified) {
      setVerificationBlocking(false);
      toast({
        title: "All Required Verifications Completed",
        description: "The conversation can now continue",
        variant: "default"
      });
    }
  };

  // Handle verifying system check
  const handleVerifySystemCheck = (messageId: string) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId && message.requiresVerification) {
        return { ...message, isVerified: true };
      }
      return message;
    }));
    
    setLastMessageUpdate(new Date());
    
    // Unblock the scenario progress
    setVerificationBlocking(false);
    
    toast({
      title: "Verification Complete",
      description: "The system check has been verified and the scenario can continue",
      variant: "default"
    });
  };

  return {
    messages,
    sensitiveDataStats,
    verificationBlocking,
    lastMessageUpdate,
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    clearMessages,
    handleValidateSensitiveData,
    handleVerifySystemCheck,
    setVerificationBlocking
  };
}
