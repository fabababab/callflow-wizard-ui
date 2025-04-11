
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { AlertCircle, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

const bankDetailsSchema = z.object({
  bankName: z.string().min(2, { message: "Bank name is required" }),
  accountHolder: z.string().min(2, { message: "Account holder name is required" }),
  iban: z.string().min(15, { message: "Valid IBAN required" }),
  bic: z.string().min(8, { message: "Valid BIC/SWIFT code required" }),
});

type BankDetailsFormValues = z.infer<typeof bankDetailsSchema>;

const BankDetailsForm = () => {
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const { toast } = useToast();

  const form = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      bankName: "Deutsche Bank",
      accountHolder: "Michael Schmidt",
      iban: "DE89370400440532013000",
      bic: "DEUTDEBBXXX",
    },
  });

  const onSubmit = (data: BankDetailsFormValues) => {
    setIsSubmitting(true);
    
    if (data.bankName !== "Deutsche Bank") {
      // Simulate a "suspicious" change that triggers a security alert
      setShowSecurityAlert(true);
    } else {
      // Normal flow - simple success
      simulateSuccessfulSubmission();
    }
  };

  const simulateSuccessfulSubmission = () => {
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccessful(true);
      toast({
        title: "Bank Details Updated",
        description: "The customer's bank details have been successfully updated.",
      });
    }, 1500);
  };

  const handleProceedAnyway = () => {
    setShowSecurityAlert(false);
    simulateSuccessfulSubmission();
  };

  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          <CreditCard className="inline-block mr-2 h-5 w-5" />
          Bank Details Change
        </CardTitle>
        {isSuccessful && (
          <div className="flex items-center text-callflow-success text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-1" />
            Updated
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accountHolder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BIC/SWIFT</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || isSuccessful}
                className="gap-2"
              >
                {isSubmitting ? "Updating..." : "Update Bank Details"}
                {isSubmitting && <span className="animate-spin">⟳</span>}
              </Button>
            </div>
          </form>
        </Form>

        {/* Security Alert Dialog */}
        <Dialog open={showSecurityAlert} onOpenChange={setShowSecurityAlert}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-callflow-danger">
                <AlertCircle className="mr-2 h-5 w-5" />
                Security Verification Required
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="mb-4">Changing the bank to a new institution requires additional verification:</p>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
                <div className="flex items-start text-amber-800">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Potential Security Concern</p>
                    <p className="text-sm">The customer is changing their bank details to a different institution. Please verify this change with additional security measures.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-callflow-muted-text" />
                  <span className="text-sm">Verify identity before proceeding</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-callflow-muted-text" />
                  <span className="text-sm">Confirm change via secure channel</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-callflow-muted-text" />
                  <span className="text-sm">Document reason for bank change</span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => setShowSecurityAlert(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleProceedAnyway}>
                Proceed with Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default BankDetailsForm;
