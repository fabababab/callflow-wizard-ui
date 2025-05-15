
import React, { useState } from 'react';
import { ModuleProps } from '@/types/modules';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Check, Info, Table as TableIcon } from 'lucide-react';

interface FranchiseOption {
  amount: number;
  premium: number;
}

interface InformationTableModuleProps extends ModuleProps {
  data?: {
    title?: string;
    description?: string;
    franchiseOptions?: FranchiseOption[];
    tableTitle?: string;
    buttonText?: string;
    isInline?: boolean;
  };
}

const InformationTableModule: React.FC<InformationTableModuleProps> = ({
  id,
  title,
  data,
  onClose,
  onComplete,
}) => {
  const [selectedFranchise, setSelectedFranchise] = useState<number | null>(null);
  
  // Default to 1000 as the pre-selected option as specified
  React.useEffect(() => {
    setSelectedFranchise(1000);
  }, []);

  const handleAcknowledge = () => {
    onComplete({
      acknowledged: true,
      selectedFranchise: selectedFranchise || 1000,
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const handleFranchiseSelect = (amount: number) => {
    setSelectedFranchise(amount);
  };

  const franchiseOptions = data?.franchiseOptions || [
    { amount: 300, premium: 400 },
    { amount: 500, premium: 360 },
    { amount: 1000, premium: 310 },
    { amount: 1500, premium: 270 },
    { amount: 2000, premium: 240 },
    { amount: 2500, premium: 220 }
  ];
  
  const moduleTitle = data?.title || title || "Auswirkungen bei gleichbleibendem Modell";
  const description = data?.description || "Please review this important information about your insurance coverage.";
  const tableTitle = data?.tableTitle || "Franchise Optionen";
  const buttonText = data?.buttonText || "Acknowledge";
  const isInline = data?.isInline || false;

  return (
    <div className={`bg-white rounded-lg overflow-hidden ${isInline ? '' : 'shadow-lg'}`}>
      <div className="p-4 bg-amber-50 border-b border-amber-200 flex gap-2 items-center">
        <Info className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-medium text-amber-800">{moduleTitle}</h2>
      </div>
      
      <div className="p-4">
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TableIcon className="h-4 w-4 text-amber-600" />
            <h3 className="font-medium text-amber-800">{tableTitle}</h3>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-amber-50">
                  <TableHead className="w-1/3">Franchise</TableHead>
                  <TableHead className="w-1/3">Prämie</TableHead>
                  <TableHead className="w-1/3">Auswahl</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {franchiseOptions.map((option) => (
                  <TableRow key={option.amount}>
                    <TableCell>{formatCurrency(option.amount)}</TableCell>
                    <TableCell>{formatCurrency(option.premium)}</TableCell>
                    <TableCell>
                      <Button 
                        variant={selectedFranchise === option.amount ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFranchiseSelect(option.amount)}
                        className={selectedFranchise === option.amount ? "bg-amber-600 hover:bg-amber-700" : ""}
                      >
                        {selectedFranchise === option.amount && <Check className="h-4 w-4 mr-1" />}
                        {option.amount === 1000 ? "Empfohlen" : "Auswählen"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleAcknowledge}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InformationTableModule;
