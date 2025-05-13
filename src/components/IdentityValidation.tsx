
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import FormFields, { FormValues } from './identity-validation/FormFields';
import ValidationSuccess from './identity-validation/ValidationSuccess';
import AISuggestionPanel from './identity-validation/AISuggestionPanel';

const IdentityValidation = () => {
  const { toast } = useToast();
  const [isValidated, setIsValidated] = useState(false);
  const [showValidationSuccess, setShowValidationSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionAccepted, setSuggestionAccepted] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    dateOfBirth: '',
    postalCode: '',
    policyNumber: '',
  });
  
  // Reference data for Wizard-of-Oz validation
  const correctValues = {
    dateOfBirth: '15/03/1985',
    postalCode: '10115',
    policyNumber: '12345678'
  };
  
  const validateIdentity = (values: FormValues) => {
    setIsValidating(true);
    setFormValues(values);
    
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
        
        // Toast notification commented out for now - will be re-integrated later
        // toast({
        //   title: "Identity Verified",
        //   description: "Customer identity has been successfully verified.",
        // });
      } else {
        // Toast notification commented out for now - will be re-integrated later
        // toast({
        //   title: "Verification Failed",
        //   description: "The provided details do not match our records.",
        //   variant: "destructive",
        // });
        
        // Show AI suggestion after failed validation
        setTimeout(() => {
          setShowSuggestion(true);
        }, 1000);
      }
    }, 1500);
  };
  
  const handleAcceptSuggestion = () => {
    setSuggestionAccepted(true);
    const updatedValues = {
      dateOfBirth: correctValues.dateOfBirth,
      postalCode: correctValues.postalCode,
      policyNumber: correctValues.policyNumber
    };
    setFormValues(updatedValues);
    
    // Toast notification commented out for now - will be re-integrated later
    // toast({
    //   title: "Suggestion Applied",
    //   description: "Customer details have been updated from system records.",
    // });
    
    // Auto-validate after applying suggestion
    setTimeout(() => {
      validateIdentity(updatedValues);
    }, 500);
  };
  
  const handleRejectSuggestion = () => {
    setShowSuggestion(false);
    
    // Toast notification commented out for now - will be re-integrated later
    // toast({
    //   title: "Suggestion Rejected",
    //   description: "Please continue with manual verification.",
    // });
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
          <ValidationSuccess />
        ) : (
          <FormFields 
            onSubmit={validateIdentity}
            isValidating={isValidating}
            isValidated={isValidated}
            defaultValues={formValues}
          />
        )}
        
        {/* AI Suggestion Panel */}
        <AISuggestionPanel
          showSuggestion={showSuggestion}
          suggestionAccepted={suggestionAccepted}
          onAcceptSuggestion={handleAcceptSuggestion}
          onRejectSuggestion={handleRejectSuggestion}
          isValidated={isValidated}
        />
      </CardContent>
    </Card>
  );
};

export default IdentityValidation;
