import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { SensitiveField } from '@/data/scenarioData';
import { cn } from '@/lib/utils';

interface InlineChatVerificationProps {
  messageId: string;
  sensitiveFields: SensitiveField[];
  onVerificationComplete: (messageId: string, result: { verified: boolean }) => void;
  onCancel: () => void;
  autoVerify?: boolean;
  className?: string;
}

const InlineChatVerification = ({ 
  messageId,
  sensitiveFields,
  onVerificationComplete,
  onCancel,
  autoVerify = false,
  className
}: InlineChatVerificationProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  
  const { addNotification } = useNotifications();
  
  // Handle field value changes
  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  // Auto-verify if enabled
  useEffect(() => {
    if (autoVerify) {
      handleVerify();
    }
  }, [autoVerify]);
  
  // Verify the sensitive fields
  const handleVerify = () => {
    setIsVerifying(true);
    setVerificationFailed(false);
    
    // Simulate verification process with timeout
    setTimeout(() => {
      // Check if all required fields are filled
      const allFieldsFilled = sensitiveFields.every(field => 
        fieldValues[field.id] && fieldValues[field.id].trim() !== ''
      );
      
      if (allFieldsFilled) {
        setIsVerified(true);
        setIsVerifying(false);
        
        // Dispatch custom event for verification success
        const verificationEvent = new CustomEvent('verification-successful', {
          detail: { messageId, fields: fieldValues }
        });
        window.dispatchEvent(verificationEvent);
        
        // Call the completion callback
        onVerificationComplete(messageId, { verified: true });
        
        // Show success notification
        handleVerificationSuccess();
      } else {
        setVerificationFailed(true);
        setIsVerifying(false);
      }
    }, 1500);
  };
  
  const handleVerificationSuccess = () => {
    console.log('Verification successful for message:', messageId);
    
    // Replace toast call with notification
    addNotification({
      title: "Verification Successful",
      description: "Identity verification completed successfully",
      type: "success"
    });
    
    // Dispatch verification complete event
    const event = new CustomEvent('verification-complete', {
      detail: { messageId, success: true }
    });
    window.dispatchEvent(event);
  };
  
  const handleVerificationCancel = () => {
    console.log('Verification cancelled for message:', messageId);
    
    // Replace toast call with notification
    addNotification({
      title: "Verification Cancelled",
      description: "Identity verification process was cancelled",
      type: "warning"
    });
    
    onCancel();
  };
  
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Verify Customer Identity</CardTitle>
        <CardDescription>
          Please verify the following information before proceeding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sensitiveFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={fieldValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={isVerifying || isVerified}
              className={verificationFailed && !fieldValues[field.id] ? 'border-red-500' : ''}
            />
            {verificationFailed && !fieldValues[field.id] && (
              <p className="text-xs text-red-500">This field is required</p>
            )}
          </div>
        ))}
        
        {isVerified && (
          <div className="flex items-center justify-center p-2 bg-green-50 text-green-700 rounded-md">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Verification successful</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleVerificationCancel}
          disabled={isVerifying || isVerified}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleVerify}
          disabled={isVerifying || isVerified}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : isVerified ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Verified
            </>
          ) : (
            'Verify'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InlineChatVerification;
