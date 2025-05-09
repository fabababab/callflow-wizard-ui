
import React, { useState, useEffect } from 'react';
import { FormValues, formSchema } from '../identity-validation/FormFields';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CheckCircle, Loader, ShieldCheck } from 'lucide-react';

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
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  // Auto-submit the form after a brief delay
  useEffect(() => {
    if (!isVerified && !isVerifying && !autoVerifyStarted) {
      setAutoVerifyStarted(true);
      const timer = setTimeout(() => {
        setIsValidating(true);
        setTimeout(() => {
          setIsValidating(false);
          onVerify(true, defaultValues);
        }, 1000);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isVerified, isVerifying, autoVerifyStarted, onVerify]);
  
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
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mt-2 mb-2">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={18} className="text-amber-600" />
        <p className="text-sm text-amber-700 font-medium">Customer Identity Verification</p>
      </div>
      
      {isValidating ? (
        <div className="flex items-center justify-center h-24 gap-2 text-amber-700">
          <Loader size={18} className="animate-spin" />
          <span>Verifying customer identity...</span>
        </div>
      ) : (
        <Form {...form}>
          <form className="space-y-3">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-amber-800">Date of Birth</FormLabel>
                  <FormControl>
                    <Input placeholder="DD/MM/YYYY" {...field} className="h-8 text-sm bg-amber-50/50" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-amber-800">Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter postal code" {...field} className="h-8 text-sm bg-amber-50/50" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="policyNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-amber-800">Policy Number</FormLabel>
                  <FormControl>
                    <Input placeholder="8-digit policy number" {...field} className="h-8 text-sm bg-amber-50/50" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <Button 
              type="button" 
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Verify Identity</span>
                </>
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default InlineChatVerification;
