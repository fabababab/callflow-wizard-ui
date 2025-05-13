
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
import { toast } from "@/hooks/use-toast";

const TestScenario = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);
  const transcriptRef = useRef<HTMLDivElement>(null);
  
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
  const { currentState, error } = activeScenario;
  
  // Add notification when scenario is loaded
  useEffect(() => {
    if (scenarioState.loadedStateMachine) {
      toast({
        title: "Deutsche Version geladen",
        description: "Szenario zum Thema Versicherungsanpassung nach Studienabschluss",
        duration: 3000
      });
    }
  }, [scenarioState.loadedStateMachine]);
  
  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-0">
            <div className="h-full">
              {/* Main content section with transcript panel as the main view */}
              {scenarioState.loadedStateMachine && (
                <div className="h-full" ref={transcriptRef}>
                  <TranscriptPanel 
                    activeScenario={scenarioState.selectedStateMachine} 
                    jsonVisualization={jsonVisualization}
                  />
                </div>
              )}

              {/* Display loading or error states */}
              <LoadingErrorStates 
                isLoading={scenarioState.isLoading} 
                error={error} 
                hasStateMachine={!!scenarioState.loadedStateMachine} 
              />
            </div>
          </div>
        </div>
      </SidebarProvider>

      {/* Sensitive Field Details Dialog - this is the only dialog we should keep */}
      {scenarioState.showSensitiveFieldDetails && (
        <SensitiveFieldDetailsDialog 
          showSensitiveFieldDetails={scenarioState.showSensitiveFieldDetails} 
          handleCloseSensitiveDetails={scenarioState.handleCloseSensitiveDetails} 
        />
      )}
    </div>
  );
};

export default TestScenario;
