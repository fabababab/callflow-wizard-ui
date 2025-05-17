
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

const ValidationField: React.FC<ValidationFieldProps> = ({ field, onValidate }) => {
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
      detail: { fieldId: field.id, status, notes }
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
    <div 
      className={`p-3 rounded-lg border ${getStatusColor(field.status)} mb-2`}
      data-testid={`validation-field-${field.id}`}
      data-field-type={field.type}
      data-validation-status={field.status}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Shield size={16} className="validation-icon" />
          <span className="font-medium">{dataTypeLabels[field.type] || field.type}</span>
          <Badge variant={field.status === 'pending' ? 'outline' : field.status === 'valid' ? 'default' : 'destructive'} className="text-xs">
            {field.status.toUpperCase()}
          </Badge>
          {field.requiresVerification && (
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
              Verification Required
            </Badge>
          )}
        </div>
        <StatusIcon />
      </div>
      
      <div className="space-y-2 mb-2">
        {/* Customer provided value */}
        <div className="space-y-1">
          <div className="text-xs font-medium flex items-center gap-1">
            <span>Customer Provided:</span>
          </div>
          <div className="bg-white/50 p-2 rounded border border-gray-200">
            <code className="text-sm font-mono customer-value">{field.value}</code>
          </div>
        </div>
        
        {/* System value */}
        <div className="space-y-1">
          <div className="text-xs font-medium flex items-center gap-1">
            <Database size={12} className="text-blue-600" />
            <span>System Record:</span>
            <span 
              className="text-blue-600 underline cursor-pointer text-xs"
              onClick={() => setShowSystemDetails(!showSystemDetails)}
              data-testid="toggle-system-details"
            >
              {showSystemDetails ? "Hide source" : "Show source"}
            </span>
          </div>
          <div className={`bg-white/70 p-2 rounded border ${isMatch ? 'border-green-300' : 'border-red-300'} flex items-center gap-2`}>
            <code className="text-sm font-mono system-value">{field.systemValue}</code>
            {isMatch ? 
              <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-700 border-green-200">Match</Badge> :
              <Badge variant="outline" className="ml-auto text-xs bg-red-50 text-red-700 border-red-200">Mismatch</Badge>
            }
          </div>
        </div>
        
        {/* System source details - shown only when expanded */}
        {showSystemDetails && (
          <div className="bg-blue-50/50 p-2 rounded border border-blue-100 text-xs system-source">
            <p className="font-medium text-blue-800 mb-1">Source Details:</p>
            <p className="text-blue-700">{field.source || "Unknown source"}</p>
          </div>
        )}
      </div>
      
      {field.status === 'pending' && (
        <div className="flex gap-2 mt-3 validation-actions">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-green-100 hover:bg-green-200 text-green-700 border-green-300"
            onClick={() => handleValidate('valid')}
            data-testid="validate-valid-button"
          >
            <CheckCircle size={14} className="mr-1" />
            Valid
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
            onClick={() => handleValidate('invalid')}
            data-testid="validate-invalid-button"
          >
            <XCircle size={14} className="mr-1" />
            Invalid
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setShowNotes(!showNotes)}
            data-testid="toggle-notes-button"
          >
            {notes ? "Edit Notes" : "Add Notes"}
          </Button>
        </div>
      )}
      
      {(showNotes || notes) && (
        <div className="mt-2 notes-container">
          <Textarea
            placeholder="Add validation notes here..."
            className="text-xs"
            value={notes}
            onChange={handleNotesChange}
            onBlur={() => onValidate(field.status, notes)}
            rows={2}
            data-testid="validation-notes"
          />
        </div>
      )}
    </div>
  );
};

export default ValidationField;
