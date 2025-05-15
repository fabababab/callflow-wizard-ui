
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, History, PieChart, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ModuleProps } from '@/types/modules';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Type definition for the module's props
interface FranchiseModuleProps extends ModuleProps {}

// Type for franchise option
interface FranchiseOption {
  amount: number;
  premium: number;
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
    stepSize = 100,
    franchiseUsed = 180,
    usageHistory = [
      { year: '2024', used: 180, total: 300, claims: 2 },
      { year: '2023', used: 450, total: 500, claims: 5 },
      { year: '2022', used: 300, total: 300, claims: 3 },
      { year: '2021', used: 220, total: 300, claims: 2 }
    ],
    franchiseOptions = [
      { amount: 300, premium: 400 },
      { amount: 500, premium: 360 },
      { amount: 1000, premium: 310 },
      { amount: 1500, premium: 270 },
      { amount: 2000, premium: 240 },
      { amount: 2500, premium: 220 }
    ]
  } = data;

  const [selectedFranchise, setSelectedFranchise] = useState<number>(currentFranchise);
  const [activeTab, setActiveTab] = useState<string>('options');
  const [animateProgress, setAnimateProgress] = useState<boolean>(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => {
      setAnimateProgress(true);
    }, 300);
  }, []);

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

  // Calculate percentage of franchise used
  const calculateUsagePercentage = (used: number, total: number): number => {
    return Math.min(Math.round((used / total) * 100), 100);
  };

  const handleSliderChange = (value: number[]) => {
    setSelectedFranchise(value[0]);
  };

  const handleSelectFranchise = (amount: number) => {
    setSelectedFranchise(amount);
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
      description: `Ihre Franchise wurde auf CHF ${selectedFranchise} geändert`,
    });

    onComplete(result);
  };

  const handleCancel = () => {
    onComplete({ action: 'cancel' });
    onClose();
  };

  // Calculate if selected franchise is different from current
  const hasChanged = selectedFranchise !== currentFranchise;
  
  // Current usage percentage
  const usagePercentage = calculateUsagePercentage(franchiseUsed, currentFranchise);

  const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  };

  return (
    <Card className="border-amber-200 bg-amber-50/50 shadow-md">
      <CardHeader className="bg-amber-50 border-b border-amber-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-amber-800">{title || 'Franchise Übersicht'}</CardTitle>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            Franchise
          </Badge>
        </div>
        <CardDescription className="text-amber-700">
          Verwalten Sie Ihre Franchise und sehen Sie die Auswirkungen auf Ihre Prämie
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 pb-2">
        <Tabs defaultValue="options" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="options" className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>Optionen</span>
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2 text-sm">
              <PieChart className="h-4 w-4" />
              <span>Nutzung</span>
            </TabsTrigger>
            <TabsTrigger value="adjust" className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4" />
              <span>Anpassen</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 text-sm">
              <History className="h-4 w-4" />
              <span>Historie</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="options" className="px-1">
            <div className="space-y-6">
              <div className="p-4 bg-white rounded-lg border border-amber-200">
                <h3 className="text-sm font-medium text-amber-800 mb-3">Auswirkungen bei gleichbleibendem Modell</h3>
                
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
                          <TableRow key={index} className={selectedFranchise === option.amount ? "bg-amber-100" : ""}>
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
                        variant={selectedFranchise === option.amount ? "default" : "outline"} 
                        className={`w-full ${selectedFranchise === option.amount ? "bg-amber-600 hover:bg-amber-700 text-white" : "border-amber-300 text-amber-800 hover:bg-amber-100"}`}
                        onClick={() => handleSelectFranchise(option.amount)}
                      >
                        CHF {formatPrice(option.amount)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {selectedFranchise === 1000 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                    <p className="font-medium">Empfehlung: CHF 1'000</p>
                    <p className="text-xs mt-1">Diese Option bietet ein optimales Verhältnis zwischen Prämie und Selbstbeteiligung.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="px-1">
            <div className="space-y-6">
              <div className="p-4 bg-white rounded-lg border border-amber-200">
                <h3 className="text-sm font-medium text-amber-800 mb-3">Aktuelle Franchise-Nutzung</h3>
                
                <div className="relative mb-2">
                  <Progress 
                    value={animateProgress ? usagePercentage : 0} 
                    className="h-3 bg-amber-200 transition-all duration-1000 ease-out"
                  />
                </div>
                
                <div className="flex justify-between text-xs text-amber-600 mb-4">
                  <span>CHF 0</span>
                  <span className="font-medium">
                    CHF {franchiseUsed} von CHF {currentFranchise} genutzt
                  </span>
                  <span>CHF {currentFranchise}</span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-amber-100/50 rounded border border-amber-100 text-sm">
                  <div>
                    <span className="text-amber-800 font-medium">
                      {usagePercentage}% genutzt
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-800 font-medium">
                      CHF {currentFranchise - franchiseUsed} verbleibend
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-amber-800 mb-2">Nutzungshistorie</h3>
                <div className="space-y-3">
                  {usageHistory.map((entry, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-amber-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-amber-800">{entry.year}</span>
                        <span className="text-xs text-amber-600">{entry.claims} Ansprüche</span>
                      </div>
                      
                      <div className="relative mb-1">
                        <Progress 
                          value={calculateUsagePercentage(entry.used, entry.total)} 
                          className="h-2 bg-amber-200"
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-amber-600">
                        <span>CHF {entry.used} genutzt</span>
                        <span>
                          {calculateUsagePercentage(entry.used, entry.total)}% von CHF {entry.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="adjust" className="px-1">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2 text-amber-800">Aktuelle Franchise: CHF {formatPrice(currentFranchise)}</h3>
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
                      <span>CHF {formatPrice(minFranchise)}</span>
                      <span className="font-medium text-amber-900 text-lg">CHF {formatPrice(selectedFranchise)}</span>
                      <span>CHF {formatPrice(maxFranchise)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {hasChanged && (
                <div className="rounded-md bg-amber-100 p-3 border border-amber-200">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">Auswirkung Ihrer Änderung</h4>
                  <div className="text-sm space-y-1 text-amber-700">
                    <p><span className="font-medium">Neue Franchise:</span> CHF {formatPrice(selectedFranchise)}</p>
                    <p><span className="font-medium">Änderung:</span> {selectedFranchise > currentFranchise ? '+' : ''}{selectedFranchise - currentFranchise} CHF</p>
                    <p><span className="font-medium">Geschätzte monatliche Einsparungen:</span> ~CHF {calculateSavings(selectedFranchise)}/Monat</p>
                    <p className="text-xs mt-2 italic">Höhere Franchise bedeutet niedrigere Prämien, aber höhere Selbstbeteiligung bei medizinischen Leistungen.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="px-1">
            <div className="space-y-4">
              <h3 className="text-sm font-medium mb-2 text-amber-800">Franchise-Historie</h3>
              <div className="space-y-3">
                {historicalData.map((entry, index) => (
                  <div key={index} className="flex justify-between p-3 rounded-md bg-white border border-amber-100">
                    <div>
                      <p className="text-sm font-medium text-amber-800">CHF {formatPrice(entry.amount)}</p>
                      <p className="text-xs text-amber-600">{entry.policyId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-amber-700">Geändert am</p>
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
          Abbrechen
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanged}
          className={`bg-amber-600 text-white hover:bg-amber-700 ${!hasChanged ? 'opacity-50' : ''}`}
        >
          Franchise aktualisieren
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FranchiseModule;
