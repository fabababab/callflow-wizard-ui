
import React, { useRef, useEffect, useState } from 'react';
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
import { useLocation } from 'react-router-dom';
import { SensitiveField } from '@/components/test-scenario/SensitiveFieldDetailsDialog';

const TestScenario = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Get scenario from location state if available
  const scenarioFromLocation = location.state?.scenario || "testscenario";
  
  // State management for scenarios, states, and visualization
  const scenarioState = useScenarioState(scenarioFromLocation);

  // Use the useJsonVisualization hook for JSON view functionality
  const jsonVisualization = useJsonVisualization(scenarioState.selectedStateMachine);

  // Use the useTranscript hook with the loaded state machine object
  const transcript = useTranscript(scenarioState.loadedStateMachine);

  // Choose the appropriate state machine
  const customerScenario = useCustomerScenario();
  const physioCoverage = usePhysioCoverageStateMachine();

  // Always use agent mode
  const activeScenario = customerScenario;
  const { currentState, error } = activeScenario;
  
  // Handle showing sensitive field details
  const [showSensitiveFieldDetails, setShowSensitiveFieldDetails] = useState<SensitiveField | null>(null);
  
  const handleCloseSensitiveDetails = () => {
    setShowSensitiveFieldDetails(null);
  };
  
  // Log changes to help debug the component
  useEffect(() => {
    console.log("TestScenario re-rendering with scenario:", scenarioFromLocation);
    console.log("Loaded state machine:", scenarioState.loadedStateMachine);
  }, [scenarioFromLocation, scenarioState.loadedStateMachine]);
  
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
      {showSensitiveFieldDetails && (
        <SensitiveFieldDetailsDialog 
          showSensitiveFieldDetails={showSensitiveFieldDetails} 
          handleCloseSensitiveDetails={handleCloseSensitiveDetails} 
        />
      )}
    </div>
  );
};

export default TestScenario;
