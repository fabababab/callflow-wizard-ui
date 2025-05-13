
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, Edit } from 'lucide-react';

export interface ContractDetails {
  policyNumber: string;
  startDate: string;
  endDate: string;
  premium: string;
  coverageType: string;
}

interface ContractDetailsComponentProps {
  contractDetails: ContractDetails;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  handleFieldChange: (field: keyof ContractDetails, value: string) => void;
}

const ContractDetailsComponent: React.FC<ContractDetailsComponentProps> = ({
  contractDetails,
  isEditing,
  setIsEditing,
  handleFieldChange
}) => {
  return (
    <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-md">
      <h3 className="text-sm font-medium mb-2 text-amber-800 flex items-center justify-between">
        <span>Contract Details</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-xs text-amber-700"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="h-3 w-3 mr-1" />
          {isEditing ? 'View' : 'Edit'}
        </Button>
      </h3>
      
      {isEditing ? (
        <div className="space-y-2">
          {Object.entries(contractDetails).map(([key, value]) => (
            <div key={key} className="grid grid-cols-1 gap-1">
              <Label htmlFor={key} className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
              <Input 
                id={key}
                value={value}
                onChange={(e) => handleFieldChange(key as keyof ContractDetails, e.target.value)}
                className="text-xs h-7 border-amber-200"
              />
            </div>
          ))}
          <div className="flex justify-end pt-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              onClick={() => setIsEditing(false)}
            >
              <Check className="h-3 w-3 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(contractDetails).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs border-b border-amber-100 pb-1 last:border-0 last:pb-0">
              <span className="text-amber-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractDetailsComponent;
