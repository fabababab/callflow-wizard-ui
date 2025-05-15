
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InformationTableModuleProps extends ModuleProps {}

interface FranchiseOption {
  amount: number;
  premium: number;
}

const InformationTableModule: React.FC<InformationTableModuleProps> = ({
  title,
  data = {},
  onComplete
}) => {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<number>(1000);
  
  const {
    description = "Please review this important information about your insurance coverage.",
    franchiseOptions = [
      { amount: 300, premium: 400 },
      { amount: 500, premium: 360 },
      { amount: 1000, premium: 310 },
      { amount: 1500, premium: 270 },
      { amount: 2000, premium: 240 },
      { amount: 2500, premium: 220 }
    ],
    tableTitle = "Franchise Optionen",
    buttonText = "Acknowledge",
    isInline = false
  } = data;
  
  // Format currency values with thousands separator
  const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  };
  
  const handleOptionSelect = (amount: number) => {
    setSelectedOption(amount);
  };
  
  const handleComplete = () => {
    const selectedFranchise = franchiseOptions.find(option => option.amount === selectedOption);
    
    toast({
      title: "Franchise Option Selected",
      description: `You've chosen the CHF ${formatPrice(selectedOption)} franchise option.`,
      duration: 3000
    });
    
    onComplete({
      acknowledged: true,
      selectedOption: selectedOption,
      premiumAmount: selectedFranchise?.premium || 0
    });
  };
  
  return (
    <Card className={`w-full ${isInline ? 'border-0 shadow-none' : 'border border-amber-200 shadow-md'}`}>
      {!isInline && (
        <CardHeader className="bg-amber-50 border-b border-amber-200">
          <CardTitle>{title || tableTitle}</CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="p-4">
        <div className="mb-4">
          <p className="text-amber-800">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Franchise</TableHead>
                  <TableHead>Prämie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {franchiseOptions.map((option, index) => (
                  <TableRow key={index} className={selectedOption === option.amount ? "bg-amber-100" : ""}>
                    <TableCell>CHF {formatPrice(option.amount)}</TableCell>
                    <TableCell>CHF {formatPrice(option.premium)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex flex-col space-y-2">
            <h4 className="text-sm font-medium text-amber-800 mb-1">Franchise wählen</h4>
            {franchiseOptions.map((option) => (
              <Button 
                key={option.amount} 
                variant={selectedOption === option.amount ? "default" : "outline"} 
                className={`w-full ${selectedOption === option.amount ? "bg-amber-600 hover:bg-amber-700 text-white" : "border-amber-300 text-amber-800 hover:bg-amber-100"}`}
                onClick={() => handleOptionSelect(option.amount)}
              >
                CHF {formatPrice(option.amount)}
              </Button>
            ))}
          </div>
        </div>
        
        {selectedOption === 1000 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
            <p className="font-medium">Empfehlung: CHF 1'000</p>
            <p className="text-xs mt-1">Diese Option bietet ein optimales Verhältnis zwischen Prämie und Selbstbeteiligung.</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className={`${isInline ? 'pt-2' : 'border-t border-amber-200 pt-3'}`}>
        <Button 
          onClick={handleComplete} 
          className="bg-amber-600 hover:bg-amber-700 text-white ml-auto"
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InformationTableModule;
