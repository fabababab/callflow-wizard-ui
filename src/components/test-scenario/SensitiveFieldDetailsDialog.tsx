
import React from 'react';
import { Shield, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { SensitiveField } from '@/data/scenarioData';

interface SensitiveFieldDetailsDialogProps {
  showSensitiveFieldDetails: SensitiveField | null;
  handleCloseSensitiveDetails: () => void;
}

const SensitiveFieldDetailsDialog: React.FC<SensitiveFieldDetailsDialogProps> = ({ 
  showSensitiveFieldDetails, 
  handleCloseSensitiveDetails 
}) => {
  if (!showSensitiveFieldDetails) return null;
  
  return (
    <Dialog open={!!showSensitiveFieldDetails} onOpenChange={() => handleCloseSensitiveDetails()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-600" />
            Sensitive Data: {showSensitiveFieldDetails?.type}
          </DialogTitle>
          <DialogDescription>
            Verification and source information
          </DialogDescription>
        </DialogHeader>
        
        {showSensitiveFieldDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <h4 className="text-sm font-medium text-yellow-800 mb-1">Customer Provided</h4>
                <p className="text-lg font-mono">{showSensitiveFieldDetails.value}</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-1">System Value</h4>
                <p className="text-lg font-mono">{showSensitiveFieldDetails.systemValue}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              {showSensitiveFieldDetails.value === showSensitiveFieldDetails.systemValue ? (
                <Badge className="bg-green-100 text-green-800 border-green-300">Match</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 border-red-300">No Match</Badge>
              )}
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md border">
              <div className="flex items-center gap-1 mb-1">
                <Database size={14} />
                <h4 className="text-sm font-medium">Source</h4>
              </div>
              <p className="text-sm">{showSensitiveFieldDetails.source || "Unknown source"}</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md border">
              <h4 className="text-sm font-medium mb-1">Validation Status</h4>
              <Badge variant={showSensitiveFieldDetails.status === 'valid' ? 'default' : showSensitiveFieldDetails.status === 'invalid' ? 'destructive' : 'outline'}>
                {showSensitiveFieldDetails.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={handleCloseSensitiveDetails}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SensitiveFieldDetailsDialog;
