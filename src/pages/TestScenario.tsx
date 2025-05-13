import React, { useRef, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useCustomerScenario } from '@/hooks/useCustomerScenario';
import { usePhysioCoverageStateMachine } from '@/hooks/usePhysioCoverageStateMachine';
import { useTranscript } from '@/hooks/useTranscript';
import TranscriptPanel from '@/components/TranscriptPanel';
import { useScenarioState } from '@/hooks/useScenarioState';
import LoadingErrorStates from '@/components/test-scenario/LoadingErrorStates';
import SensitiveFieldDetailsDialog from '@/components/test-scenario/SensitiveFieldDetailsDialog';
import { useJsonVisualization } from '@/hooks/useJsonVisualization';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ModuleType } from '@/types/modules';
const TestScenario = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const {
    toast
  } = useToast();

  // State management for scenarios, states, and visualization
  const scenarioState = useScenarioState("deutscheVersion");

  // Use the useJsonVisualization hook for JSON view functionality
  const jsonVisualization = useJsonVisualization(scenarioState.selectedStateMachine);

  // Use the useTranscript hook for the active scenario
  const transcript = useTranscript(scenarioState.selectedStateMachine);

  // Choose the appropriate state machine
  const customerScenario = useCustomerScenario();
  const physioCoverage = usePhysioCoverageStateMachine();

  // Always use agent mode
  const activeScenario = customerScenario;
  const {
    currentState,
    error
  } = activeScenario;

  // Add notification when scenario is loaded
  useEffect(() => {
    if (scenarioState.loadedStateMachine) {
      toast({
        title: "Deutsche Version geladen",
        description: "Szenario zum Thema Versicherungsanpassung nach Studienabschluss",
        duration: 3000
      });
    }
  }, [scenarioState.loadedStateMachine, toast]);

  // Demo function to trigger franchise module
  const triggerFranchiseModule = () => {
    const franchiseModule = {
      id: 'franchise-demo',
      type: ModuleType.FRANCHISE,
      title: 'Franchise Übersicht',
      data: {
        currentFranchise: 300,
        franchiseUsed: 180,
        isInline: true,
        // Make it display inline
        usageHistory: [{
          year: '2024',
          used: 180,
          total: 300,
          claims: 2
        }, {
          year: '2023',
          used: 450,
          total: 500,
          claims: 5
        }, {
          year: '2022',
          used: 300,
          total: 300,
          claims: 3
        }, {
          year: '2021',
          used: 220,
          total: 300,
          claims: 2
        }]
      }
    };

    // Add system message and inline module
    transcript.addSystemMessage("Here is your franchise overview:");
    setTimeout(() => {
      transcript.addInlineModuleMessage("Franchise information", franchiseModule);
    }, 300);
  };

  // Demo function to trigger insurance model module
  const triggerInsuranceModelModule = () => {
    const insuranceModelModule = {
      id: 'insurance-model-demo',
      type: ModuleType.INSURANCE_MODEL,
      title: 'Versicherungsmodell',
      data: {
        currentModel: 'standard',
        coverageUtilization: 65,
        isInline: true // Make it display inline
      }
    };

    // Add system message and inline module
    transcript.addSystemMessage("Here is your insurance model overview:");
    setTimeout(() => {
      transcript.addInlineModuleMessage("Insurance model information", insuranceModelModule);
    }, 300);
  };
  return <div className="flex h-screen bg-background">
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-0">
            <div className="h-full">
              {/* Main content section with transcript panel as the main view */}
              {scenarioState.loadedStateMachine && <div className="h-full" ref={transcriptRef}>
                  <TranscriptPanel activeScenario={scenarioState.selectedStateMachine} jsonVisualization={jsonVisualization} />
                  
                  {/* Demo buttons for triggering modules */}
                  <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
                    
                    
                  </div>
                </div>}

              {/* Display loading or error states */}
              <LoadingErrorStates isLoading={scenarioState.isLoading} error={error} hasStateMachine={!!scenarioState.loadedStateMachine} />
            </div>
          </div>
        </div>
      </SidebarProvider>

      {/* Sensitive Field Details Dialog - this is the only dialog we should keep */}
      {scenarioState.showSensitiveFieldDetails && <SensitiveFieldDetailsDialog showSensitiveFieldDetails={scenarioState.showSensitiveFieldDetails} handleCloseSensitiveDetails={scenarioState.handleCloseSensitiveDetails} />}
    </div>;
};
export default TestScenario;