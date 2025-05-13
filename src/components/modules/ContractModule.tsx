
import React, { useState } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Check, X, AlertTriangle, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface Contract {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'pending' | 'expired';
  startDate: string;
  endDate?: string;
  details: Record<string, any>;
}

const ContractModule: React.FC<ModuleProps> = ({ 
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}) => {
  const contracts = data?.contracts || [];
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'view' | 'edit' | 'cancel'>('view');
  const isInlineDisplay = data?.isInline === true;
  
  const handleContractAction = (contract: Contract, action: 'view' | 'edit' | 'cancel') => {
    setSelectedContract(contract);
    setDialogAction(action);
    setShowDialog(true);
  };
  
  const handleConfirmAction = () => {
    if (!selectedContract) return;
    
    if (dialogAction === 'cancel') {
      if (onComplete) {
        onComplete({
          action: 'cancel',
          contractId: selectedContract.id
        });
      }
    } else if (dialogAction === 'edit') {
      if (onComplete) {
        onComplete({
          action: 'edit',
          contractId: selectedContract.id
        });
      }
    }
    
    setShowDialog(false);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const cardClassName = isInlineDisplay
    ? "w-full border-l-4 border-blue-300 border-r border-t border-b border-blue-200 shadow-sm rounded-md bg-blue-50/60"
    : "w-full max-w-md border border-blue-200 shadow-md";
  
  return (
    <>
      <Card className={cardClassName}>
        <CardHeader className={`${isInlineDisplay ? "bg-transparent py-2 pb-0" : "bg-blue-50 border-b border-blue-100"}`}>
          <div className="flex items-center gap-2">
            <FileText className={`${isInlineDisplay ? "h-4 w-4" : "h-5 w-5"} text-blue-600`} />
            <CardTitle className={`${isInlineDisplay ? "text-blue-700 text-sm" : "text-blue-900"}`}>
              {title || 'Contract Overview'}
            </CardTitle>
          </div>
          <CardDescription className={`text-xs ${isInlineDisplay ? "text-blue-600/70" : ""}`}>
            Review and manage your contracts
          </CardDescription>
        </CardHeader>
        
        <CardContent className={`${isInlineDisplay ? "pt-2" : "pt-6"} space-y-4`}>
          {contracts.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No contracts available</p>
          ) : (
            contracts.map((contract: Contract) => (
              <div key={contract.id} className="border rounded-md p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-medium ${isInlineDisplay ? "text-sm" : ""}`}>{contract.name}</h3>
                  {getStatusBadge(contract.status)}
                </div>
                <p className="text-sm text-gray-500 mb-3">{contract.type}</p>
                <div className="text-xs text-gray-500 mb-3">
                  Valid from {contract.startDate}
                  {contract.endDate && <> to {contract.endDate}</>}
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleContractAction(contract, 'view')}
                    className={isInlineDisplay ? "text-xs" : ""}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleContractAction(contract, 'edit')}
                    className={isInlineDisplay ? "text-xs" : ""}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${isInlineDisplay ? "text-xs" : ""}`}
                    onClick={() => handleContractAction(contract, 'cancel')}
                  >
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
        
        <CardFooter className={`flex justify-end ${isInlineDisplay ? "py-2 bg-transparent border-t border-blue-100/50" : "bg-gray-50 border-t"}`}>
          <Button 
            variant="outline" 
            onClick={onClose}
            className={isInlineDisplay ? "text-xs" : ""}
          >
            Close
          </Button>
        </CardFooter>
      </Card>
      
      {/* Contract Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'view' && 'Contract Details'}
              {dialogAction === 'edit' && 'Edit Contract'}
              {dialogAction === 'cancel' && 'Cancel Contract'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'view' && 'Review your contract details'}
              {dialogAction === 'edit' && 'Make changes to your contract'}
              {dialogAction === 'cancel' && 'Are you sure you want to cancel this contract?'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedContract && (
            <div className="py-4">
              {dialogAction === 'view' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{selectedContract.name}</h3>
                    <p className="text-sm text-gray-500">{selectedContract.type}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    {Object.entries(selectedContract.details).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-2">
                        <span className="text-sm font-medium">{key}</span>
                        <span className="text-sm">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {dialogAction === 'cancel' && (
                <div className="bg-red-50 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Warning</span>
                  </div>
                  <p className="text-sm text-red-800 mb-2">
                    You are about to cancel your contract "{selectedContract.name}". This action cannot be undone.
                  </p>
                  <p className="text-sm text-gray-700">
                    Please confirm that you want to proceed with the cancellation.
                  </p>
                </div>
              )}
              
              {dialogAction === 'edit' && (
                <p className="text-center py-4">
                  Edit functionality would be implemented here based on specific contract fields
                </p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {dialogAction === 'view' ? 'Close' : 'Cancel'}
            </Button>
            
            {dialogAction !== 'view' && (
              <Button 
                onClick={handleConfirmAction}
                variant={dialogAction === 'cancel' ? 'destructive' : 'default'}
              >
                {dialogAction === 'cancel' ? 'Confirm Cancellation' : 'Save Changes'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContractModule;
