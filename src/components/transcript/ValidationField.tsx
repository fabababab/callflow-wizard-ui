
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Shield } from 'lucide-react';
import { SensitiveField, ValidationStatus, SensitiveDataType } from '@/data/scenarioData';

interface ValidationFieldProps {
  field: SensitiveField;
  onValidate: (fieldId: string, status: ValidationStatus, notes?: string) => void;
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
  const [showNotes, setShowNotes] = useState(false);
  
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
        return <CheckCircle size={16} className="text-green-600" />;
      case 'invalid':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-yellow-600" />;
    }
  };
  
  // Handle validation actions
  const handleValidate = (status: ValidationStatus) => {
    onValidate(field.id, status, notes);
  };
  
  // Handle note changes
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  return (
    <div className={`p-3 rounded-lg border ${getStatusColor(field.status)} mb-2`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Shield size={16} />
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
      
      <div className="bg-white/50 p-2 rounded border border-gray-200 mb-2">
        <code className="text-sm font-mono">{field.value}</code>
      </div>
      
      {field.status === 'pending' && (
        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-green-100 hover:bg-green-200 text-green-700 border-green-300"
            onClick={() => handleValidate('valid')}
          >
            <CheckCircle size={14} className="mr-1" />
            Valid
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
            onClick={() => handleValidate('invalid')}
          >
            <XCircle size={14} className="mr-1" />
            Invalid
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setShowNotes(!showNotes)}
          >
            Add Notes
          </Button>
        </div>
      )}
      
      {(showNotes || notes) && (
        <div className="mt-2">
          <Textarea
            placeholder="Add validation notes here..."
            className="text-xs"
            value={notes}
            onChange={handleNotesChange}
            onBlur={() => onValidate(field.id, field.status, notes)}
            rows={2}
          />
        </div>
      )}
    </div>
  );
};

export default ValidationField;
