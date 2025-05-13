
import React, { useState, memo } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import the new components
import CalculatorComponent from './contract/CalculatorComponent';
import ContractDetailsComponent, { ContractDetails } from './contract/ContractDetailsComponent';
import ActionButtons from './contract/ActionButtons';

const ContractModule: React.FC<ModuleProps> = memo(({ 
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [contractDetails, setContractDetails] = useState<ContractDetails>(data?.contractDetails || {
    policyNumber: "PL-12345678",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    premium: "€149,50",
    coverageType: "Full Coverage"
  });
  const isInlineDisplay = data?.isInline === true;
  const { toast } = useToast();
  
  // Handle contract acceptance
  const handleAccept = () => {
    console.log(`ContractModule ${id} completed`);
    onComplete({ 
      accepted: true,
      contractDetails,
      timestamp: new Date().toISOString()
    });
    
    toast({
      title: "Contract Accepted",
      description: "You've successfully accepted the contract terms",
      duration: 2000
    });
  };
  
  // Handle field change when editing
  const handleFieldChange = (field: keyof ContractDetails, value: string) => {
    setContractDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Card styling with yellowish theme
  const cardClassName = isInlineDisplay
    ? "w-full ml-auto border-l-4 border-amber-300 border-r border-t border-b border-amber-200 shadow-sm rounded-md bg-amber-50/60 transition-all duration-300"
    : "w-full max-w-md border border-amber-200 shadow-md transition-all duration-300";
  
  return (
    <Card className={cardClassName}>
      <CardHeader className={`${isInlineDisplay ? "bg-transparent py-2 pb-0" : "bg-amber-50 border-b border-amber-100 py-3"}`}>
        <div className="flex items-center gap-2">
          <FileText className={`${isInlineDisplay ? "h-4 w-4" : "h-5 w-5"} text-amber-500`} />
          <CardTitle className={`${isInlineDisplay ? "text-amber-700 text-sm" : "text-amber-900 text-base"}`}>
            {title || 'Insurance Contract'}
          </CardTitle>
        </div>
        <CardDescription className={`text-xs ${isInlineDisplay ? "text-amber-600/70" : ""}`}>
          {data?.description || "Please review your contract details"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className={`${isInlineDisplay ? "pt-2" : "pt-4"} space-y-3`}>
        {/* Contract Details Section - now uses the ContractDetailsComponent */}
        <ContractDetailsComponent 
          contractDetails={contractDetails}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleFieldChange={handleFieldChange}
        />
        
        {/* Action Buttons - now uses the ActionButtons component */}
        <ActionButtons 
          showCalculator={showCalculator}
          setShowCalculator={setShowCalculator}
        />
        
        {/* Calculator Section - now uses the CalculatorComponent */}
        {showCalculator && <CalculatorComponent />}
        
        {/* Contract Summary */}
        <div className="text-xs text-amber-700">
          <p>This contract outlines the terms and conditions of your insurance policy. By accepting this contract, you agree to the premium payments and coverage details specified above.</p>
        </div>
        
        {/* Accept Contract Button */}
        <Button 
          size="sm" 
          variant="default"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          onClick={handleAccept}
        >
          Accept Contract Terms
        </Button>
      </CardContent>
      
      {!isInlineDisplay && (
        <CardFooter className="bg-gray-50 border-t py-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Close
          </Button>
        </CardFooter>
      )}
    </Card>
  );
});

ContractModule.displayName = 'ContractModule';

export default ContractModule;
