
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TranscriptPanel from '@/components/TranscriptPanel';
import CallDetails from '@/components/CallDetails';
import IdentityValidation from '@/components/IdentityValidation';
import ActionPanel from '@/components/ActionPanel';
import CallEvaluation from '@/components/CallEvaluation';
import BankDetailsForm from '@/components/BankDetailsForm';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { ScenarioType } from '@/components/ScenarioSelector';
import { ChevronDown, ChevronUp, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  // Move useState hooks inside the component body
  const [activeScenario, setActiveScenario] = React.useState<ScenarioType | null>(null);
  const [availableScenarios, setAvailableScenarios] = React.useState<ScenarioType[]>([]);
  const [showScenarioDialog, setShowScenarioDialog] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for collapsible panels
  const [callDetailsOpen, setCallDetailsOpen] = React.useState(true);
  const [identityValidationOpen, setIdentityValidationOpen] = React.useState(true);
  const [bankDetailsOpen, setBankDetailsOpen] = React.useState(true);
  const [actionPanelOpen, setActionPanelOpen] = React.useState(true);
  const [callEvaluationOpen, setCallEvaluationOpen] = React.useState(true);
  
  // State for right sidebar collapse
  const [rightSidebarOpen, setRightSidebarOpen] = React.useState(true);
  
  // Check for scenario in state from navigation
  React.useEffect(() => {
    if (location.state?.scenario) {
      setActiveScenario(location.state.scenario);
    }
  }, [location.state]);

  // Initialize available scenarios when component mounts
  React.useEffect(() => {
    initializeScenarios();
  }, []);

  // Function to initialize or reset available scenarios
  const initializeScenarios = () => {
    const allScenarios: ScenarioType[] = [
      'verificationFlow', 
      'contractManagement', 
      'productInfo', 
      'testscenario'
    ];
    
    // Randomly select 3 scenarios (or fewer if there aren't enough available)
    const shuffled = [...allScenarios].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    setAvailableScenarios(selected);
    
    // Show dialog to select first scenario if no active scenario
    if (!activeScenario) {
      setShowScenarioDialog(true);
    }
  };

  // Function to select a scenario
  const selectScenario = (scenario: ScenarioType) => {
    setActiveScenario(scenario);
    setShowScenarioDialog(false);
    
    const scenarioNames: Record<ScenarioType, string> = {
      'testscenario': 'Test Scenario',
      'verificationFlow': 'Identity Verification',
      'contractManagement': 'Contract Management',
      'productInfo': 'Product Information',
      'verification': 'Identity Verification (Legacy)',
      'bankDetails': 'Change Bank Details',
      'accountHistory': 'Account History Review',
      'physioTherapy': 'Physiotherapy Coverage',
      'paymentReminder': 'Payment Reminder Dispute',
      'insurancePackage': 'Insurance Package Update'
    };
    
    toast({
      title: "Scenario Selected",
      description: `You are now working on the ${scenarioNames[scenario]} scenario.`,
    });
  };

  // Function to handle "Next Call" button
  const handleNextCall = () => {
    setActiveScenario(null);
    initializeScenarios();
    toast({
      title: "Ready for Next Call",
      description: "Previous call data has been reset.",
    });
  };

  // Helper function to render collapsible sections
  const renderCollapsibleSection = (
    title: string, 
    isOpen: boolean, 
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>, 
    component: React.ReactNode
  ) => (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mb-3 rounded-lg border shadow-sm"
    >
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full flex justify-between items-center p-3 rounded-lg"
        >
          <span className="font-medium">{title}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-1">
          {component}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden relative">
          {/* Next Call button - positioned top right */}
          <div className="absolute left-0 top-0 z-20 mt-4 ml-6">
            <Button 
              variant="outline" 
              onClick={handleNextCall}
              className="gap-2 border-2 border-gray-300 bg-white text-muted-foreground hover:bg-background hover:text-foreground hover:border-gray-400 transition-all shadow-md"
            >
              <RefreshCw size={16} />
              Next Call
            </Button>
          </div>
          
          {/* Toggle button for right sidebar - Positioned right beneath the navbar */}
          <div className="absolute right-0 top-0 z-20 mt-4 mr-6">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full border-2 border-gray-300 bg-white text-muted-foreground hover:bg-background hover:text-foreground hover:border-gray-400 transition-all shadow-md"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              aria-label={rightSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {rightSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>
          </div>
          
          <Sidebar />
          <div className="flex-1 p-6 overflow-auto bg-callflow-background">
            <div className="grid grid-cols-12 gap-6 h-full">
              {/* Main content area - Call transcript */}
              <div className={`col-span-12 ${rightSidebarOpen ? 'lg:col-span-7' : 'lg:col-span-11'} h-full transition-all duration-300`}>
                <TranscriptPanel activeScenario={activeScenario} />
              </div>
              
              {/* Right sidebar with tools and info */}
              <div className={`relative col-span-12 ${rightSidebarOpen ? 'lg:col-span-5' : 'lg:col-span-1 lg:overflow-hidden'} transition-all duration-300`}>
                <div className={`space-y-3 ${rightSidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'} transition-opacity duration-300`}>
                  {renderCollapsibleSection(
                    "Call Details", 
                    callDetailsOpen, 
                    setCallDetailsOpen, 
                    <CallDetails 
                      customerName="Michael Schmidt"
                      phoneNumber="+49 123 456 7890"
                      callDuration="00:04:32"
                      callType="Customer Support"
                      startTime="14:32"
                      date="11 Apr 2025"
                    />
                  )}
                  
                  {renderCollapsibleSection(
                    "Identity Validation", 
                    identityValidationOpen, 
                    setIdentityValidationOpen, 
                    <IdentityValidation />
                  )}
                  
                  {activeScenario === 'bankDetails' && renderCollapsibleSection(
                    "Bank Details", 
                    bankDetailsOpen, 
                    setBankDetailsOpen, 
                    <BankDetailsForm />
                  )}
                  
                  {renderCollapsibleSection(
                    "Action Panel", 
                    actionPanelOpen, 
                    setActionPanelOpen, 
                    <ActionPanel />
                  )}
                  
                  {renderCollapsibleSection(
                    "Call Evaluation", 
                    callEvaluationOpen, 
                    setCallEvaluationOpen, 
                    <CallEvaluation />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scenario Selection Dialog */}
      <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Scenario</DialogTitle>
            <DialogDescription>
              Please select one of the following scenarios for your call.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {availableScenarios.map((scenario) => (
              <Button 
                key={scenario} 
                onClick={() => selectScenario(scenario)}
                className="justify-start text-left"
              >
                {scenario === 'testscenario' && 'Test Scenario'}
                {scenario === 'verificationFlow' && 'Identity Verification'}
                {scenario === 'contractManagement' && 'Contract Management'}
                {scenario === 'productInfo' && 'Product Information'}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={initializeScenarios}>Shuffle Scenarios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Index;
