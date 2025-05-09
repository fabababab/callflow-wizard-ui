
import React from 'react';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const formSchema = z.object({
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

export type FormValues = z.infer<typeof formSchema>;

interface FormFieldsProps {
  onSubmit: (values: FormValues) => void;
  isValidating: boolean;
  isValidated: boolean;
  defaultValues?: FormValues;
}

const FormFields: React.FC<FormFieldsProps> = ({ 
  onSubmit, 
  isValidating, 
  isValidated,
  defaultValues = {
    dateOfBirth: '',
    postalCode: '',
    policyNumber: '',
  }
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  return (
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
  );
};

export default FormFields;
