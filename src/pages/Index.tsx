
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TranscriptPanel from '@/components/TranscriptPanel';
import CallDetails from '@/components/CallDetails';
import IdentityValidation from '@/components/IdentityValidation';
import ActionPanel from '@/components/ActionPanel';
import CallEvaluation from '@/components/CallEvaluation';
import BankDetailsForm from '@/components/BankDetailsForm';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useLocation } from 'react-router-dom';
import { ScenarioType } from '@/components/Header';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>(null);
  const location = useLocation();
  
  // State for collapsible panels
  const [callDetailsOpen, setCallDetailsOpen] = useState(true);
  const [identityValidationOpen, setIdentityValidationOpen] = useState(true);
  const [bankDetailsOpen, setBankDetailsOpen] = useState(true);
  const [actionPanelOpen, setActionPanelOpen] = useState(true);
  const [callEvaluationOpen, setCallEvaluationOpen] = useState(true);
  
  // Check for scenario in state from navigation
  useEffect(() => {
    if (location.state?.scenario) {
      setActiveScenario(location.state.scenario);
    }
  }, [location.state]);

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
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto bg-callflow-background">
            <div className="grid grid-cols-12 gap-6 h-full">
              {/* Main content area - Call transcript */}
              <div className="col-span-12 lg:col-span-7 h-full">
                <TranscriptPanel activeScenario={activeScenario} />
              </div>
              
              {/* Right sidebar with tools and info */}
              <div className="col-span-12 lg:col-span-5 space-y-3">
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
