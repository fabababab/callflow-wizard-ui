
import React, { useState } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, AlertCircle, Edit, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Contract {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'pending' | 'expired';
  startDate: string;
  endDate?: string;
  details: Record<string, any>;
}

const ContractManagementModule: React.FC<ModuleProps> = ({ 
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}) => {
  const contracts = data?.contracts || [];
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'view' | 'edit' | 'renew' | 'cancel'>('view');
  const isInlineDisplay = data?.isInline === true;
  
  const handleContractAction = (contract: Contract, action: 'view' | 'edit' | 'renew' | 'cancel') => {
    setSelectedContract(contract);
    setDialogAction(action);
    setShowDialog(true);
  };
  
  const handleConfirmAction = () => {
    if (!selectedContract) return;
    
    // After action is confirmed, notify the parent component
    if (onComplete) {
      onComplete({
        action: dialogAction,
        contractId: selectedContract.id,
        contractName: selectedContract.name,
        success: true
      });
    }
    
    // Close the dialog
    setShowDialog(false);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Pending</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleDoneClick = () => {
    if (onComplete) {
      onComplete({
        action: 'done',
        message: 'Contract review completed'
      });
    }
  };
  
  const cardClassName = isInlineDisplay
    ? "w-full ml-auto border-l-4 border-blue-300 border-r border-t border-b border-blue-200 shadow-sm rounded-md bg-blue-50/60"
    : "w-full max-w-2xl border border-blue-200 shadow-md";
  
  return (
    <>
      <Card className={cardClassName}>
        <CardHeader className={`${isInlineDisplay ? "bg-transparent py-2 pb-0" : "bg-blue-50 border-b border-blue-100 py-3"}`}>
          <div className="flex items-center gap-2">
            <FileText className={`${isInlineDisplay ? "h-4 w-4" : "h-5 w-5"} text-blue-600`} />
            <CardTitle className={`${isInlineDisplay ? "text-blue-700 text-sm" : "text-blue-900 text-base"}`}>
              {title || 'Contract Management'}
            </CardTitle>
          </div>
          <CardDescription className={`text-xs ${isInlineDisplay ? "text-blue-600/70" : ""}`}>
            Review and manage your insurance contracts
          </CardDescription>
        </CardHeader>
        
        <CardContent className={`${isInlineDisplay ? "pt-2" : "pt-4"} space-y-4`}>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
            
            {['active', 'pending', 'expired'].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="space-y-4 mt-2">
                {contracts.filter(c => c.status === tabValue).length === 0 ? (
                  <p className="text-center text-gray-500 py-4 text-sm">No {tabValue} contracts</p>
                ) : (
                  contracts.filter(c => c.status === tabValue).map((contract: Contract) => (
                    <div key={contract.id} className="border rounded-md p-3 hover:bg-gray-50/80">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{contract.name}</h3>
                        {getStatusBadge(contract.status)}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{contract.type}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Calendar className="h-3 w-3" /> 
                        <span>Valid from {contract.startDate}
                        {contract.endDate && <> to {contract.endDate}</>}</span>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleContractAction(contract, 'view')}
                          className="text-xs"
                        >
                          View Details
                        </Button>
                        
                        {contract.status === 'active' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleContractAction(contract, 'edit')}
                            className="text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        )}
                        
                        {contract.status === 'expired' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                            onClick={() => handleContractAction(contract, 'renew')}
                          >
                            <Clock className="h-3 w-3 mr-1" /> Renew
                          </Button>
                        )}
                        
                        {contract.status === 'active' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleContractAction(contract, 'cancel')}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        
        <CardFooter className={`flex justify-end ${isInlineDisplay ? "py-2 bg-transparent border-t border-blue-100/50" : "bg-gray-50 border-t py-2"}`}>
          <Button 
            onClick={handleDoneClick} 
            className={`text-xs ${isInlineDisplay ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}`}
          >
            Done
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
              {dialogAction === 'renew' && 'Renew Contract'}
              {dialogAction === 'cancel' && 'Cancel Contract'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'view' && 'Review your contract details'}
              {dialogAction === 'edit' && 'Make changes to your contract'}
              {dialogAction === 'renew' && 'Renew your expired contract'}
              {dialogAction === 'cancel' && 'Are you sure you want to cancel this contract?'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedContract && (
            <div className="py-2">
              {dialogAction === 'view' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{selectedContract.name}</h3>
                    <p className="text-sm text-gray-500">{selectedContract.type}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3" /> 
                      <span>
                        {selectedContract.startDate}
                        {selectedContract.endDate && <> - {selectedContract.endDate}</>}
                      </span>
                      <span className="ml-2">{getStatusBadge(selectedContract.status)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium mb-2">Contract Details</h4>
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
                    <AlertCircle className="h-5 w-5" />
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
              
              {dialogAction === 'renew' && (
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Renew Contract</span>
                  </div>
                  <p className="text-sm text-green-800 mb-2">
                    You are about to renew your expired contract "{selectedContract.name}".
                  </p>
                  <p className="text-sm text-gray-700">
                    The new contract will begin immediately and use the same terms as your previous contract.
                  </p>
                </div>
              )}
              
              {dialogAction === 'edit' && (
                <div className="space-y-4">
                  <p className="text-center py-2 text-gray-600 text-sm">
                    Edit functionality would be implemented here based on specific contract fields
                  </p>
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      For this demo, we'll simulate a successful contract edit.
                    </p>
                  </div>
                </div>
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
                variant={dialogAction === 'cancel' ? 'destructive' : dialogAction === 'renew' ? 'default' : 'default'}
                className={dialogAction === 'renew' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {dialogAction === 'cancel' ? 'Confirm Cancellation' : 
                 dialogAction === 'renew' ? 'Confirm Renewal' : 'Save Changes'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default React.memo(ContractManagementModule);
