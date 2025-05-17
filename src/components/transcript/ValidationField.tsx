
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
  
  return (
    <div className="validation-field p-3 rounded-md border mb-2" data-field-id={field.id} data-testid={`validation-field-${field.id}`}>
      <div className={`flex flex-col space-y-2 ${getStatusColor(field.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon />
            <span className="font-medium text-sm">{dataTypeLabels[field.type] || field.type}</span>
            <Badge variant="outline" className="text-xs font-normal">
              {field.requiresVerification ? 'Verification Required' : 'Optional'}
            </Badge>
          </div>
          
          {/* System value toggle button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSystemDetails(!showSystemDetails)}
            className="text-xs flex items-center gap-1"
          >
            <Database size={14} />
            {showSystemDetails ? 'Hide' : 'System Data'}
          </Button>
        </div>
        
        {/* Values comparison section */}
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-start justify-between">
            <span className="text-gray-600">Customer Value:</span>
            <span className="font-medium">{field.value}</span>
          </div>
          
          {/* System value (shown conditionally) */}
          {showSystemDetails && (
            <>
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">System Value:</span>
                <span className="font-medium">{field.systemValue}</span>
              </div>
              {field.source && (
                <div className="flex items-start justify-between text-xs text-gray-500">
                  <span>Source:</span>
                  <span>{field.source}</span>
                </div>
              )}
              <div className="flex items-center justify-end text-xs">
                <Badge variant={isMatch ? 'outline' : 'destructive'} className="text-xs">
                  {isMatch ? 'Match' : 'Mismatch'}
                </Badge>
              </div>
            </>
          )}
        </div>
        
        {/* Validation actions */}
        <div className="flex items-center space-x-2 pt-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700" 
            onClick={() => handleValidate('valid')}
          >
            <CheckCircle size={14} />
            Valid
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
            onClick={() => handleValidate('invalid')}
          >
            <XCircle size={14} />
            Invalid
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto" 
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? 'Hide Notes' : 'Add Notes'}
          </Button>
        </div>
        
        {/* Notes textarea (shown conditionally) */}
        {showNotes && (
          <div className="pt-2">
            <Textarea
              placeholder="Add verification notes here..."
              className="text-sm"
              value={notes}
              onChange={handleNotesChange}
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationField;
