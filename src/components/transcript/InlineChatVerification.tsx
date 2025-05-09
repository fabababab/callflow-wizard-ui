
import React, { useState, useEffect } from 'react';
import { FormValues } from '../identity-validation/FormFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Loader, ShieldCheck } from 'lucide-react';

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
  
  // Default values that will always verify successfully
  const defaultValues = {
    dateOfBirth: '15/03/1985',
    postalCode: '10115',
    policyNumber: '12345678',
  };
  
  // Debug logging for verification rendering
  useEffect(() => {
    console.log("InlineChatVerification rendering - isVerified:", isVerified, "isVerifying:", isVerifying);
  }, [isVerified, isVerifying]);
  
  // Auto-submit the form after a brief delay
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
      <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-2">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">Identity Verified</span>
        </div>
        <p className="text-xs text-green-600 mt-1 pl-6">All customer details have been confirmed.</p>
      </div>
    );
  }
  
  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={18} className="text-amber-600" />
        <p className="text-sm text-amber-700 font-medium">Customer Identity Verification</p>
      </div>
      
      {isValidating ? (
        <div className="flex items-center justify-center h-16 gap-2 text-amber-700">
          <Loader size={18} className="animate-spin" />
          <span>Verifying customer identity...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 mb-3">
            <div>
              <label className="text-xs text-amber-800 mb-1 block">Customer ID</label>
              <Input 
                placeholder="Enter customer ID" 
                value="ACC123456" 
                readOnly
                className="h-8 text-sm bg-amber-50/50" 
              />
            </div>
            
            <div>
              <label className="text-xs text-amber-800 mb-1 block">Email Address</label>
              <Input 
                placeholder="Enter email address" 
                value="customer@example.com"
                readOnly
                className="h-8 text-sm bg-amber-50/50" 
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => onVerify(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
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
