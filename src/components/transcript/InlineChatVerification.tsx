
import React, { useState, useEffect, useRef, memo } from 'react';
import { FormValues } from '../identity-validation/FormFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Loader, ShieldCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InlineChatVerificationProps {
  onVerify: (verified: boolean, data?: FormValues) => void;
  isVerifying?: boolean;
  isVerified?: boolean;
}

const InlineChatVerification: React.FC<InlineChatVerificationProps> = ({
  onVerify,
  isVerifying = false,
  isVerified = false
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const { toast } = useToast();
  const hasShownToastRef = useRef(false);
  const verificationCompleteRef = useRef(false);
  
  // Default values that will always verify successfully
  const defaultValues = {
    dateOfBirth: '15/03/1985',
    postalCode: '10115',
    policyNumber: '12345678',
  };
  
  // Auto-verify on mount
  useEffect(() => {
    if (!isVerified && !isVerifying && !isProcessingRef.current && !verificationCompleteRef.current) {
      // Add a slight delay to make the verification process visible
      const timeout = setTimeout(() => {
        handleVerifyClick();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isVerified, isVerifying]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);
  
  const handleVerifyClick = () => {
    // Prevent multiple clicks or processing if verification is already complete
    if (isProcessingRef.current || isValidating || verificationCompleteRef.current) return;
    
    isProcessingRef.current = true;
    console.log("Verify button clicked or auto-triggered");
    setIsValidating(true);
    
    // Use a delay to show the verification process
    verificationTimeoutRef.current = setTimeout(() => {
      setIsValidating(false);
      console.log("Manual verification complete, calling onVerify(true)");
      
      // Mark verification as complete
      verificationCompleteRef.current = true;
      
      // Always succeed with verification
      onVerify(true, defaultValues);
      
      // Show success toast only once
      if (!hasShownToastRef.current) {
        toast.toast({
          title: "Identity Verified",
          description: "Customer identity has been automatically verified",
          duration: 2000
        });
        hasShownToastRef.current = true;
      }
      
      // Dispatch a custom event to trigger state transition after verification
      // Include a unique timestamp as part of the event data
      const eventId = `inline-verification-${Date.now()}`;
      const event = new CustomEvent('verification-complete', {
        detail: { 
          success: true,
          eventId: eventId
        }
      });
      console.log("Dispatching verification-complete event with ID:", eventId);
      window.dispatchEvent(event);
      
      // Reset processing state after a delay
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    }, 1500);
  };
  
  // If already verified, show success state
  if (isVerified) {
    return (
      <div className="p-2 bg-green-50 border-l-4 border-green-400 rounded-md mt-2 transition-all duration-300">
        <div className="flex items-center gap-1.5 text-green-700">
          <CheckCircle size={14} />
          <span className="text-xs font-medium">Identity Verified</span>
        </div>
        <p className="text-xs text-green-600 mt-0.5 pl-5">All customer details have been confirmed.</p>
      </div>
    );
  }
  
  return (
    <div 
      className="p-3 bg-amber-50/60 border-l-4 border-amber-300 rounded-md w-full transition-all duration-300" 
      data-testid="verification-form"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <ShieldCheck size={16} className="text-amber-500" />
        <p className="text-xs text-amber-700 font-medium">Customer Verification Required</p>
      </div>
      
      {verificationFailed && (
        <div className="mb-3 p-2 bg-red-50 rounded-md flex items-center gap-2 transition-opacity duration-300">
          <AlertCircle size={14} className="text-red-500" />
          <p className="text-xs text-red-700">Verification failed. Please check your information.</p>
        </div>
      )}
      
      {isValidating ? (
        <div className="flex items-center justify-center h-12 gap-2 text-amber-700 text-xs transition-opacity duration-300">
          <Loader size={14} className="animate-spin" />
          <span>Verifying customer identity...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className="text-xs text-amber-800/80 mb-1 block">Customer ID</label>
              <Input 
                placeholder="Enter customer ID" 
                value="ACC123456" 
                readOnly
                className="h-7 text-xs bg-amber-50/50 border-amber-200" 
              />
            </div>
            
            <div>
              <label className="text-xs text-amber-800/80 mb-1 block">Email Address</label>
              <Input 
                placeholder="Enter email address" 
                value="customer@example.com"
                readOnly
                className="h-7 text-xs bg-amber-50/50 border-amber-200" 
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end mt-3">
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              className="text-xs h-7 px-2 py-0 bg-white/80 hover:bg-white border-amber-200 text-amber-800"
              onClick={() => {
                if (!isProcessingRef.current) onVerify(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-3 py-0"
              onClick={handleVerifyClick}
              disabled={isProcessingRef.current || isValidating || verificationCompleteRef.current}
            >
              Verify
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(InlineChatVerification);
