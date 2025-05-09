
import React, { useState } from 'react';
import { FormValues, formSchema } from '../identity-validation/FormFields';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CheckCircle, Loader } from 'lucide-react';

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
  
  // Default values for the form
  const defaultValues = {
    dateOfBirth: '',
    postalCode: '',
    policyNumber: '',
  };
  
  // Reference data for verification (this would normally come from an API)
  const correctValues = {
    dateOfBirth: '15/03/1985',
    postalCode: '10115',
    policyNumber: '12345678'
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const handleSubmit = (values: FormValues) => {
    setIsValidating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsValidating(false);
      
      // Check if values match the "correct" values
      const isValid = 
        values.dateOfBirth === correctValues.dateOfBirth &&
        values.postalCode === correctValues.postalCode &&
        values.policyNumber === correctValues.policyNumber;
      
      onVerify(isValid, values);
    }, 1000);
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
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mt-2 mb-2">
      <p className="text-sm text-amber-700 mb-3">Please verify customer identity to continue:</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-amber-800">Date of Birth</FormLabel>
                <FormControl>
                  <Input placeholder="DD/MM/YYYY" {...field} className="h-8 text-sm" />
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
                  <Input placeholder="Enter postal code" {...field} className="h-8 text-sm" />
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
                  <Input placeholder="8-digit policy number" {...field} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            disabled={isValidating || isVerifying}
          >
            {isValidating || isVerifying ? (
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
    </div>
  );
};

export default InlineChatVerification;
