
import React, { useState, useEffect, useRef, memo } from 'react';
import { FormValues } from '../identity-validation/FormFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Loader, ShieldCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  const [localVerified, setLocalVerified] = useState(isVerified);
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const hasDispatchedEventRef = useRef(false);
  const { toast } = useToast();
  const hasShownToastRef = useRef(false);
  
  // Default values that will always verify successfully
  const defaultValues = {
    dateOfBirth: '15/03/1985',
    postalCode: '10115',
    policyNumber: '12345678',
  };

  // Update local state when props change
  useEffect(() => {
    if (isVerified) {
      setLocalVerified(true);
    }
  }, [isVerified]);
  
  // Auto-verify on mount
  useEffect(() => {
    if (!localVerified && !isVerifying && !isProcessingRef.current) {
      // Add a slight delay to make the verification process visible
      const timeout = setTimeout(() => {
        handleVerifyClick();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [localVerified, isVerifying]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  // Function to safely dispatch verification event
  const dispatchVerificationEvent = (success: boolean) => {
    console.log("Dispatching inline verification event:", success);
    
    try {
      // Create and dispatch multiple events for redundancy
      const verificationEvent = new CustomEvent('verification-complete', {
        detail: { 
          success: success, 
          moduleId: 'inline-chat-verification',
          autoTransition: true,
          triggerState: 'customer_issue'
        }
      });
      window.dispatchEvent(verificationEvent);
      
      // Send a second event type for additional reliability
      const backupEvent = new CustomEvent('verification-successful', {
        detail: { 
          success: success, 
          moduleId: 'inline-chat-verification',
          autoTransition: true,
          triggerState: 'customer_issue'
        }
      });
      window.dispatchEvent(backupEvent);
      
      console.log("Inline verification events dispatched successfully with autoTransition flag");
      return true;
    } catch (error) {
      console.error("Failed to dispatch verification event:", error);
      return false;
    }
  };
  
  const handleVerifyClick = () => {
    // Prevent multiple clicks
    if (isProcessingRef.current || isValidating) return;
    
    isProcessingRef.current = true;
    console.log("Verify button clicked or auto-triggered");
    setIsValidating(true);
    
    // Use a delay to show the verification process
    verificationTimeoutRef.current = setTimeout(() => {
      setIsValidating(false);
      console.log("Inline verification complete, calling onVerify(true)");
      
      // Set local verified state
      setLocalVerified(true);
      
      // First dispatch verification events - should happen before onVerify
      if (!hasDispatchedEventRef.current) {
        dispatchVerificationEvent(true);
        hasDispatchedEventRef.current = true;
      }
      
      // Then call onVerify callback
      onVerify(true, defaultValues);
      
      // Reset processing state after a delay
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    }, 1500);
  };
  
  // If already verified, show success state
  if (localVerified) {
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
              disabled={isProcessingRef.current || isValidating}
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
