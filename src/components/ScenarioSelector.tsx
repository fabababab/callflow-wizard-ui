
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Shield, FileText, Phone, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type ScenarioType = 
  | 'verification' 
  | 'bankDetails' 
  | 'accountHistory' 
  | 'physioTherapy'
  | 'paymentReminder'
  | 'insurancePackage'
  | null;

interface ScenarioSelectorProps {
  onSelectScenario: (scenario: ScenarioType) => void;
  activeScenario: ScenarioType;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ 
  onSelectScenario, 
  activeScenario 
}) => {
  const { toast } = useToast();

  const handleSelectScenario = (scenario: ScenarioType) => {
    onSelectScenario(scenario);
    
    const scenarioNames = {
      'verification': 'Identity Verification',
      'bankDetails': 'Change Bank Details',
      'accountHistory': 'Account History Review',
      'physioTherapy': 'Leistungsabdeckung Physiobehandlung',
      'paymentReminder': 'Mahnung trotz Zahlung',
      'insurancePackage': 'Neues Versicherungspacket (Studiumsabschluss)'
    };
    
    toast({
      title: `Scenario Selected`,
      description: `${scenarioNames[scenario as keyof typeof scenarioNames]} scenario activated`,
    });
  };

  return (
    <Card className="rounded-lg mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Call Scenarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={activeScenario === 'verification' ? 'default' : 'outline'} 
            className="flex flex-col items-center justify-center h-20 p-2"
            onClick={() => handleSelectScenario('verification')}
          >
            <Shield className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Identity Verification</span>
          </Button>
          
          <Button 
            variant={activeScenario === 'bankDetails' ? 'default' : 'outline'} 
            className="flex flex-col items-center justify-center h-20 p-2"
            onClick={() => handleSelectScenario('bankDetails')}
          >
            <CreditCard className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Change Bank Details</span>
          </Button>
          
          <Button 
            variant={activeScenario === 'accountHistory' ? 'default' : 'outline'} 
            className="flex flex-col items-center justify-center h-20 p-2"
            onClick={() => handleSelectScenario('accountHistory')}
          >
            <FileText className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Account History</span>
          </Button>

          <Button 
            variant={activeScenario === 'physioTherapy' ? 'default' : 'outline'} 
            className="flex flex-col items-center justify-center h-20 p-2"
            onClick={() => handleSelectScenario('physioTherapy')}
          >
            <Calendar className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Physiobehandlung</span>
          </Button>
          
          <Button 
            variant={activeScenario === 'paymentReminder' ? 'default' : 'outline'} 
            className="flex flex-col items-center justify-center h-20 p-2"
            onClick={() => handleSelectScenario('paymentReminder')}
          >
            <AlertCircle className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Mahnung</span>
          </Button>
          
          <Button 
            variant={activeScenario === 'insurancePackage' ? 'default' : 'outline'} 
            className="flex flex-col items-center justify-center h-20 p-2"
            onClick={() => handleSelectScenario('insurancePackage')}
          >
            <Phone className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Versicherungspacket</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioSelector;
