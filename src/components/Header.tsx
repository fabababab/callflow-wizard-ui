
import React, { useState } from 'react';
import { Bell, Settings, User, CreditCard, Shield, FileText, Phone, X, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';

export type ScenarioType = 
  | 'verification' 
  | 'bankDetails' 
  | 'accountHistory'
  | 'physioTherapy'
  | 'paymentReminder'
  | 'insurancePackage'
  | null;

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scenario, setScenario] = useState<ScenarioType>(null);

  const handleSelectScenario = (selectedScenario: ScenarioType) => {
    setScenario(selectedScenario);
    
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
      description: `${scenarioNames[selectedScenario as keyof typeof scenarioNames]} scenario activated`,
    });
    
    navigate('/', { state: { scenario: selectedScenario } });
  };

  return (
    <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-callflow-primary">CallFlow Wizard</h1>
        <span className="bg-callflow-accent/10 text-callflow-accent text-xs px-2 py-0.5 rounded-full">
          Beta
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Phone size={16} />
              Call Scenarios
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Call Scenarios</DialogTitle>
              <DialogDescription>
                Select a scenario to simulate a customer call.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              <Button 
                variant={scenario === 'verification' ? 'default' : 'outline'} 
                className="flex flex-col items-center justify-center h-24 p-2"
                onClick={() => handleSelectScenario('verification')}
              >
                <Shield className="h-8 w-8 mb-2" />
                <span className="text-xs text-center">Identity Verification</span>
              </Button>
              
              <Button 
                variant={scenario === 'bankDetails' ? 'default' : 'outline'} 
                className="flex flex-col items-center justify-center h-24 p-2"
                onClick={() => handleSelectScenario('bankDetails')}
              >
                <CreditCard className="h-8 w-8 mb-2" />
                <span className="text-xs text-center">Change Bank Details</span>
              </Button>
              
              <Button 
                variant={scenario === 'accountHistory' ? 'default' : 'outline'} 
                className="flex flex-col items-center justify-center h-24 p-2"
                onClick={() => handleSelectScenario('accountHistory')}
              >
                <FileText className="h-8 w-8 mb-2" />
                <span className="text-xs text-center">Account History</span>
              </Button>

              <Button 
                variant={scenario === 'physioTherapy' ? 'default' : 'outline'} 
                className="flex flex-col items-center justify-center h-24 p-2"
                onClick={() => handleSelectScenario('physioTherapy')}
              >
                <Calendar className="h-8 w-8 mb-2" />
                <span className="text-xs text-center">Leistungsabdeckung Physiobehandlung</span>
              </Button>
              
              <Button 
                variant={scenario === 'paymentReminder' ? 'default' : 'outline'} 
                className="flex flex-col items-center justify-center h-24 p-2"
                onClick={() => handleSelectScenario('paymentReminder')}
              >
                <AlertCircle className="h-8 w-8 mb-2" />
                <span className="text-xs text-center">Mahnung trotz Zahlung</span>
              </Button>
              
              <Button 
                variant={scenario === 'insurancePackage' ? 'default' : 'outline'} 
                className="flex flex-col items-center justify-center h-24 p-2"
                onClick={() => handleSelectScenario('insurancePackage')}
              >
                <Phone className="h-8 w-8 mb-2" />
                <span className="text-xs text-center">Neues Versicherungspacket</span>
              </Button>
            </div>
            <DialogClose asChild>
              <Button variant="outline" className="w-full">
                <X size={16} className="mr-2" /> Close
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>

        <Button variant="ghost" size="icon" className="text-callflow-text">
          <Bell size={20} />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-callflow-text">
          <Settings size={20} />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-callflow-primary flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <span className="text-sm font-medium">Agent Name</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
