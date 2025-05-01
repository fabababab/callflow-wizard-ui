
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  dateOfBirth: z.string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, {
      message: 'Date of birth must be in format DD/MM/YYYY',
    }),
  postalCode: z.string()
    .min(5, { message: 'Postal code must be at least 5 characters' }),
  policyNumber: z.string()
    .regex(/^\d{8}$/, {
      message: 'Policy number must be 8 digits',
    }),
});

type FormValues = z.infer<typeof formSchema>;

const IdentityValidation = () => {
  const { toast } = useToast();
  const [isValidated, setIsValidated] = React.useState(false);
  const [showValidationSuccess, setShowValidationSuccess] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(false);
  const [showSuggestion, setShowSuggestion] = React.useState(false);
  const [suggestionAccepted, setSuggestionAccepted] = React.useState(false);
  
  // Reference data for Wizard-of-Oz validation
  const correctValues = {
    dateOfBirth: '15/03/1985',
    postalCode: '10115',
    policyNumber: '12345678'
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateOfBirth: '',
      postalCode: '',
      policyNumber: '',
    },
  });
  
  const validateIdentity = (values: FormValues) => {
    setIsValidating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsValidating(false);
      
      // Check if values match the "correct" values (Wizard-of-Oz)
      if (
        values.dateOfBirth === correctValues.dateOfBirth &&
        values.postalCode === correctValues.postalCode &&
        values.policyNumber === correctValues.policyNumber
      ) {
        setIsValidated(true);
        setShowValidationSuccess(true);
        toast({
          title: "Identity Verified",
          description: "Customer identity has been successfully verified.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "The provided details do not match our records.",
          variant: "destructive",
        });
        
        // Show AI suggestion after failed validation
        setTimeout(() => {
          setShowSuggestion(true);
        }, 1000);
      }
    }, 1500);
  };
  
  const onSubmit = (values: FormValues) => {
    validateIdentity(values);
  };
  
  const handleAcceptSuggestion = () => {
    setSuggestionAccepted(true);
    form.setValue('dateOfBirth', correctValues.dateOfBirth);
    form.setValue('postalCode', correctValues.postalCode);
    form.setValue('policyNumber', correctValues.policyNumber);
    
    toast({
      title: "Suggestion Applied",
      description: "Customer details have been updated from system records.",
    });
    
    // Auto-validate after applying suggestion
    setTimeout(() => {
      validateIdentity({
        dateOfBirth: correctValues.dateOfBirth,
        postalCode: correctValues.postalCode,
        policyNumber: correctValues.policyNumber
      });
    }, 500);
  };
  
  const handleRejectSuggestion = () => {
    setShowSuggestion(false);
    toast({
      title: "Suggestion Rejected",
      description: "Please continue with manual verification.",
    });
  };
  
  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Identity Verification</span>
          {isValidated && (
            <Badge variant="outline" className="font-normal bg-callflow-success/10 text-callflow-success border-callflow-success/20">
              <CheckCircle size={14} className="mr-1" />
              Verified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showValidationSuccess ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              <span className="font-medium">Identity Verified</span>
            </div>
            <p className="mt-1 pl-6">All customer details have been confirmed.</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input placeholder="DD/MM/YYYY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter postal code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="policyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number</FormLabel>
                    <FormControl>
                      <Input placeholder="8-digit policy number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isValidating || isValidated}
              >
                {isValidating ? "Validating..." : "Verify Identity"}
              </Button>
            </form>
          </Form>
        )}
        
        {/* AI Suggestion Panel */}
        {showSuggestion && !isValidated && (
          <div className={`mt-4 border ${suggestionAccepted ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'} rounded-md p-4 text-sm animate-fade-in`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle size={16} className={suggestionAccepted ? "text-green-600" : "text-blue-600"} />
                <span className={suggestionAccepted ? "text-green-600" : "text-blue-600"}>AI Suggestion</span>
              </div>
              {suggestionAccepted && (
                <Badge variant="outline" className="font-normal bg-green-100 text-green-700 border-green-200">
                  Applied
                </Badge>
              )}
            </div>
            
            <p className="mb-3">
              I found matching customer records in the system. Would you like to use these verified details?
            </p>
            
            {!suggestionAccepted && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-blue-300 hover:bg-blue-100"
                  onClick={handleAcceptSuggestion}
                >
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-blue-700"
                  onClick={handleRejectSuggestion}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IdentityValidation;
