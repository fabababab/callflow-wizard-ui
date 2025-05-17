
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

const TestScenario = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize with leistungsabdeckungPhysio scenario
  const scenarioState = useScenarioState("leistungsabdeckungPhysio");

  // Use the useJsonVisualization hook for JSON view functionality
  const jsonVisualization = useJsonVisualization(scenarioState.selectedStateMachine);

  // Use the useTranscript hook for the active scenario with testscenario source
  const transcript = useTranscript(scenarioState.selectedStateMachine, { source: 'testscenario' });

  // Choose the appropriate state machine
  const customerScenario = useCustomerScenario();
  const physioCoverage = usePhysioCoverageStateMachine();

  // Use physioCoverage for this component
  const activeScenario = physioCoverage;
  const { currentState, error, stateData } = activeScenario;

  // Add notification when scenario is loaded and monitor state changes
  useEffect(() => {
    if (scenarioState.loadedStateMachine) {
      console.log("Leistungsabdeckung Physio scenario loaded");
      toast({
        title: "Leistungsabdeckung Physio geladen",
        description: "Szenario zum Thema Physiotherapie-Leistungsabdeckung",
        duration: 3000
      });
      
      // Log initial state information
      if (currentState) {
        console.log(`Current state on load: ${currentState}`);
      }
      
      // Check for modules in the state
      if (stateData?.meta?.module) {
        console.log('Module found in initial state:', stateData.meta.module);
      }
      
      // Check for sensitive data
      if (stateData?.meta?.module?.data?.sensitiveFields) {
        console.log('Sensitive fields detected:', stateData.meta.module.data.sensitiveFields);
      }
      
      // Log response options if available
      const responseOptions = stateData?.meta?.responseOptions || [];
      if (responseOptions.length > 0) {
        console.log('Response options in initial state:', responseOptions);
      }
    }
  }, [scenarioState.loadedStateMachine, toast, currentState, stateData]);

  // Monitor state changes for debugging
  useEffect(() => {
    if (currentState) {
      console.log(`State changed to: ${currentState}`);
      
      // Check for inline modules
      if (stateData?.meta?.module) {
        const moduleConfig = stateData.meta.module;
        console.log(`Module in state ${currentState}:`, moduleConfig);
        
        // Log whether the module should be inline
        console.log(`Module ${moduleConfig.id} isInline:`, 
          moduleConfig.data?.isInline !== false ? "true" : "false");
      }
    }
  }, [currentState, stateData]);

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

      {/* Sensitive Field Details Dialog */}
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
