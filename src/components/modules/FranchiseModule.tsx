
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Type definition for the module's props
interface FranchiseModuleProps {
  id: string;
  title: string;
  data?: {
    customerId?: string;
    currentFranchise?: number;
    historicalData?: Array<{
      date: string;
      amount: number;
      policyId: string;
    }>;
    minFranchise?: number;
    maxFranchise?: number;
    stepSize?: number;
    isInline?: boolean;
  };
  onClose: () => void;
  onComplete: (result: any) => void;
}

const FranchiseModule: React.FC<FranchiseModuleProps> = ({
  id,
  title,
  data = {},
  onClose,
  onComplete
}) => {
  const { toast } = useToast();
  const {
    currentFranchise = 300,
    historicalData = [
      { date: '2024-01-15', amount: 300, policyId: 'POL-2024-001' },
      { date: '2023-01-10', amount: 500, policyId: 'POL-2023-001' },
      { date: '2022-01-05', amount: 300, policyId: 'POL-2022-001' }
    ],
    minFranchise = 300,
    maxFranchise = 2500,
    stepSize = 100
  } = data;

  const [selectedFranchise, setSelectedFranchise] = useState<number>(currentFranchise);
  const [activeTab, setActiveTab] = useState<string>('adjust');

  // Calculate annual savings based on franchise difference
  const calculateSavings = (franchiseAmount: number): number => {
    // Simple calculation: each 100 CHF increase in franchise saves roughly 10% of that in premium
    const franchiseDifference = franchiseAmount - minFranchise;
    return Math.round((franchiseDifference / 100) * 10);
  };

  // Format date from YYYY-MM-DD to DD.MM.YYYY
  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const handleSliderChange = (value: number[]) => {
    setSelectedFranchise(value[0]);
  };

  const handleSave = () => {
    const result = {
      action: 'update',
      franchiseAmount: selectedFranchise,
      previousAmount: currentFranchise,
      changeAmount: selectedFranchise - currentFranchise,
      annualSavings: calculateSavings(selectedFranchise)
    };

    toast({
      title: "Franchise Updated",
      description: `Your franchise has been changed to CHF ${selectedFranchise}`,
    });

    onComplete(result);
  };

  const handleCancel = () => {
    onComplete({ action: 'cancel' });
    onClose();
  };

  // Calculate if selected franchise is different from current
  const hasChanged = selectedFranchise !== currentFranchise;

  // Get available franchise options
  const getFranchiseOptions = (): number[] => {
    const options: number[] = [];
    for (let i = minFranchise; i <= maxFranchise; i += stepSize) {
      options.push(i);
    }
    return options;
  };

  return (
    <Card className="border-amber-200 bg-amber-50/50 shadow-md">
      <CardHeader className="bg-amber-50 border-b border-amber-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-amber-800">{title}</CardTitle>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            Franchise
          </Badge>
        </div>
        <CardDescription className="text-amber-700">
          View your franchise history or adjust your franchise amount
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 pb-2">
        <Tabs defaultValue="adjust" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="adjust" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Adjust Franchise</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="adjust" className="px-1">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2 text-amber-800">Current Franchise: CHF {currentFranchise}</h3>
                <div className="mb-6">
                  <div className="mb-6">
                    <Slider
                      defaultValue={[currentFranchise]}
                      value={[selectedFranchise]}
                      onValueChange={handleSliderChange}
                      max={maxFranchise}
                      min={minFranchise}
                      step={stepSize}
                      className="py-4"
                    />
                    <div className="flex justify-between items-center mt-2 text-sm text-amber-700">
                      <span>CHF {minFranchise}</span>
                      <span className="font-medium text-amber-900 text-lg">CHF {selectedFranchise}</span>
                      <span>CHF {maxFranchise}</span>
                    </div>
                  </div>
                </div>
              </div>

              {hasChanged && (
                <div className="rounded-md bg-amber-100 p-3 border border-amber-200">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">Impact of your change</h4>
                  <div className="text-sm space-y-1 text-amber-700">
                    <p><span className="font-medium">New franchise:</span> CHF {selectedFranchise}</p>
                    <p><span className="font-medium">Change:</span> {selectedFranchise > currentFranchise ? '+' : ''}{selectedFranchise - currentFranchise} CHF</p>
                    <p><span className="font-medium">Estimated annual savings:</span> ~CHF {calculateSavings(selectedFranchise)}/month</p>
                    <p className="text-xs mt-2 italic">Higher franchise means lower premiums but higher out-of-pocket costs for medical services.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="px-1">
            <div className="space-y-4">
              <h3 className="text-sm font-medium mb-2 text-amber-800">Franchise History</h3>
              <div className="space-y-3">
                {historicalData.map((entry, index) => (
                  <div key={index} className="flex justify-between p-3 rounded-md bg-white border border-amber-100">
                    <div>
                      <p className="text-sm font-medium text-amber-800">CHF {entry.amount}</p>
                      <p className="text-xs text-amber-600">{entry.policyId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-amber-700">Changed on</p>
                      <p className="text-xs font-medium">{formatDate(entry.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-amber-200 pt-3 bg-amber-50/80">
        <Button variant="outline" onClick={handleCancel} className="border-amber-300 text-amber-800 hover:bg-amber-100">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanged}
          className={`bg-amber-600 text-white hover:bg-amber-700 ${!hasChanged ? 'opacity-50' : ''}`}
        >
          Update Franchise
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FranchiseModule;
