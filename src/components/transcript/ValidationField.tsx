import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Shield, Database } from 'lucide-react';
import { SensitiveField, ValidationStatus, SensitiveDataType } from '@/data/scenarioData';
interface ValidationFieldProps {
  field: SensitiveField;
  onValidate: (status: ValidationStatus, notes?: string) => void;
}

// Map of data types to human-readable labels
const dataTypeLabels: Record<SensitiveDataType, string> = {
  insurance_number: 'Insurance Number',
  customer_id: 'Customer ID',
  bank_account: 'Bank Account',
  date_of_birth: 'Date of Birth',
  address: 'Address'
};
const ValidationField: React.FC<ValidationFieldProps> = ({
  field,
  onValidate
}) => {
  const [notes, setNotes] = useState(field.notes || '');
  const [showNotes, setShowNotes] = useState(!!field.notes);
  const [showSystemDetails, setShowSystemDetails] = useState(false);

  // Get the appropriate color based on validation status
  const getStatusColor = (status: ValidationStatus) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 border-green-300 text-green-700';
      case 'invalid':
        return 'bg-red-100 border-red-300 text-red-700';
      default:
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
    }
  };

  // Get the appropriate icon based on validation status
  const StatusIcon = () => {
    switch (field.status) {
      case 'valid':
        return <CheckCircle size={16} className="text-green-600" data-testid="valid-icon" />;
      case 'invalid':
        return <XCircle size={16} className="text-red-600" data-testid="invalid-icon" />;
      default:
        return <AlertCircle size={16} className="text-yellow-600" data-testid="pending-icon" />;
    }
  };

  // Handle validation actions
  const handleValidate = (status: ValidationStatus) => {
    // Dispatch a validation event that can be caught by other components
    const event = new CustomEvent('field-validation', {
      detail: {
        fieldId: field.id,
        status,
        notes
      }
    });
    window.dispatchEvent(event);

    // Call the onValidate callback
    onValidate(status, notes);
  };

  // Handle note changes
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  // Determine if the customer value matches the system value
  const isMatch = field.value === field.systemValue;
  return;
};
export default ValidationField;