
import React, { useState, memo } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Check, Calculator, Edit, Download, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ContractModule: React.FC<ModuleProps> = memo(({ 
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [contractDetails, setContractDetails] = useState(data?.contractDetails || {
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
  const handleFieldChange = (field: string, value: string) => {
    setContractDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Simple calculator component
  const Calculator = () => {
    const [amount, setAmount] = useState("1000");
    const [years, setYears] = useState("1");
    const [rate, setRate] = useState("2.5");
    
    const calculateInterest = () => {
      const principal = parseFloat(amount);
      const time = parseFloat(years);
      const interestRate = parseFloat(rate) / 100;
      
      if (isNaN(principal) || isNaN(time) || isNaN(interestRate)) {
        return "Please enter valid numbers";
      }
      
      const interest = principal * interestRate * time;
      const total = principal + interest;
      
      return `Interest: €${interest.toFixed(2)}\nTotal: €${total.toFixed(2)}`;
    };
    
    return (
      <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-md space-y-2 my-3">
        <h4 className="text-sm font-medium text-amber-800 flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Payment Calculator
        </h4>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <Label htmlFor="amount" className="text-xs">Amount (€)</Label>
            <Input 
              id="amount" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              type="text" 
              className="text-xs h-7 border-amber-200"
            />
          </div>
          <div>
            <Label htmlFor="years" className="text-xs">Years</Label>
            <Input 
              id="years" 
              value={years} 
              onChange={(e) => setYears(e.target.value)} 
              type="text" 
              className="text-xs h-7 border-amber-200"
            />
          </div>
          <div>
            <Label htmlFor="rate" className="text-xs">Interest Rate (%)</Label>
            <Input 
              id="rate" 
              value={rate} 
              onChange={(e) => setRate(e.target.value)} 
              type="text" 
              className="text-xs h-7 border-amber-200"
            />
          </div>
        </div>
        <div className="mt-2 p-2 bg-white rounded border border-amber-100 font-mono text-xs whitespace-pre-line">
          {calculateInterest()}
        </div>
      </div>
    );
  };
  
  // Card styling with yellowish theme
  const cardClassName = isInlineDisplay
    ? "w-full ml-auto border-l-4 border-amber-300 border-r border-t border-b border-amber-200 shadow-sm rounded-md bg-amber-50/60 transition-all duration-300"
    : "w-full max-w-md border border-amber-200 shadow-md transition-all duration-300";
  
  return (
    <Card className={cardClassName} data-testid={`contract-module-${id}`}>
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
        {/* Contract Details Section */}
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
                    onChange={(e) => handleFieldChange(key, e.target.value)}
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
        
        {/* Calculator Toggle */}
        <div className="flex justify-between">
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={() => setShowCalculator(!showCalculator)}
          >
            <Calculator className="h-3 w-3" />
            {showCalculator ? 'Hide Calculator' : 'Payment Calculator'}
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs flex items-center gap-1"
            onClick={() => toast({
              title: "Contract Downloaded",
              description: "The contract was downloaded successfully",
              duration: 2000
            })}
          >
            <Download className="h-3 w-3" />
            Download Contract
          </Button>
        </div>
        
        {/* Calculator Section */}
        {showCalculator && <Calculator />}
        
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
