
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

// Define the SensitiveField type
export interface SensitiveField {
  id: string;
  type: string;
  value: string;
  pattern?: string;
  status: 'pending' | 'verified' | 'rejected';
  requiresVerification: boolean;
  systemValue?: string;
  source?: string;
  matched?: boolean;
}

interface SensitiveFieldDetailsDialogProps {
  showSensitiveFieldDetails: SensitiveField | null;
  handleCloseSensitiveDetails: () => void;
}

const SensitiveFieldDetailsDialog: React.FC<SensitiveFieldDetailsDialogProps> = ({
  showSensitiveFieldDetails,
  handleCloseSensitiveDetails
}) => {
  // If no sensitive field details to show, don't render the dialog
  if (!showSensitiveFieldDetails) return null;
  
  const field = showSensitiveFieldDetails;
  const isMatched = field.matched !== false; // Default to true if not specified
  
  return (
    <Dialog open={!!showSensitiveFieldDetails} onOpenChange={handleCloseSensitiveDetails}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <DialogTitle>Sensitive Data Details</DialogTitle>
          </div>
          <DialogDescription>
            Information about detected sensitive data field
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-3 border rounded-md bg-amber-50 border-amber-200">
            <h3 className="text-sm font-medium mb-2 text-amber-800">Field Information</h3>
            <dl className="grid grid-cols-3 gap-2 text-sm">
              <dt className="text-gray-500">Type:</dt>
              <dd className="col-span-2 font-medium">{field.type}</dd>
              
              <dt className="text-gray-500">Value:</dt>
              <dd className="col-span-2 font-medium">{field.value}</dd>
              
              {field.systemValue && (
                <>
                  <dt className="text-gray-500">Expected:</dt>
                  <dd className="col-span-2 font-medium">{field.systemValue}</dd>
                </>
              )}
              
              <dt className="text-gray-500">Source:</dt>
              <dd className="col-span-2">{field.source || 'User Input'}</dd>
              
              <dt className="text-gray-500">Status:</dt>
              <dd className="col-span-2 flex items-center">
                {isMatched ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle size={14} className="mr-1" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <AlertTriangle size={14} className="mr-1" /> Mismatch
                  </span>
                )}
              </dd>
            </dl>
          </div>
          
          {field.pattern && (
            <div className="p-3 border rounded-md bg-blue-50 border-blue-200">
              <h3 className="text-sm font-medium mb-2 text-blue-800">Detection Pattern</h3>
              <code className="bg-white p-2 rounded text-xs block border border-blue-100 overflow-x-auto">
                {field.pattern}
              </code>
            </div>
          )}
        </div>
        
        <DialogClose asChild>
          <Button>Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default SensitiveFieldDetailsDialog;
