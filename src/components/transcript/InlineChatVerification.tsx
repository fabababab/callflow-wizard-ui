
import React, { useState, useEffect } from 'react';
import { FormValues } from '../identity-validation/FormFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Loader, ShieldCheck, AlertCircle } from 'lucide-react';

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
  const [autoVerifyStarted, setAutoVerifyStarted] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  
  // Default values that will always verify successfully
  const defaultValues = {
    dateOfBirth: '15/03/1985',
    postalCode: '10115',
    policyNumber: '12345678',
  };
  
  // Debug logging for verification rendering
  useEffect(() => {
    console.log("InlineChatVerification rendering - isVerified:", isVerified, "isVerifying:", isVerifying, "isValidating:", isValidating, "autoVerifyStarted:", autoVerifyStarted);
  }, [isVerified, isVerifying, isValidating, autoVerifyStarted]);
  
  // Auto-submit the form after a brief delay - happens once
  useEffect(() => {
    if (!isVerified && !isVerifying && !autoVerifyStarted) {
      setAutoVerifyStarted(true);
      console.log("Starting auto verification process");
      const timer = setTimeout(() => {
        setIsValidating(true);
        setTimeout(() => {
          setIsValidating(false);
          console.log("Auto verification complete, calling onVerify(true)");
          onVerify(true, defaultValues);
        }, 1000);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isVerified, isVerifying, autoVerifyStarted, onVerify]);

  const handleVerifyClick = () => {
    console.log("Verify button clicked");
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      console.log("Manual verification complete, calling onVerify(true)");
      onVerify(true, defaultValues);
    }, 800);
  };
  
  // If already verified, show success state
  if (isVerified) {
    return (
      <div className="p-2 bg-green-50 border-l-4 border-green-400 rounded-md mt-2 animate-in fade-in duration-300">
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
      className="p-3 bg-amber-50/60 border-l-4 border-amber-300 rounded-md animate-in fade-in slide-in-right duration-300 w-full" 
      data-testid="verification-form"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <ShieldCheck size={16} className="text-amber-500" />
        <p className="text-xs text-amber-700 font-medium">Customer Verification Required</p>
      </div>
      
      {verificationFailed && (
        <div className="mb-3 p-2 bg-red-50 rounded-md flex items-center gap-2">
          <AlertCircle size={14} className="text-red-500" />
          <p className="text-xs text-red-700">Verification failed. Please check your information.</p>
        </div>
      )}
      
      {isValidating ? (
        <div className="flex items-center justify-center h-12 gap-2 text-amber-700 text-xs">
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
              onClick={() => onVerify(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-3 py-0"
              onClick={handleVerifyClick}
            >
              Verify
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default InlineChatVerification;
