
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActionButtonsProps {
  showCalculator: boolean;
  setShowCalculator: (show: boolean) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  showCalculator,
  setShowCalculator
}) => {
  const { toast } = useToast();
  
  const handleDownload = () => {
    toast({
      title: "Contract Downloaded",
      description: "The contract was downloaded successfully",
      duration: 2000
    });
  };
  
  return (
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
        onClick={handleDownload}
      >
        <Download className="h-3 w-3" />
        Download Contract
      </Button>
    </div>
  );
};

export default ActionButtons;
