
import React, { useRef } from 'react';
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
import VerificationBanner from '@/components/transcript/VerificationBanner';

const TestScenario = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);
  const transcriptRef = useRef<HTMLDivElement>(null);
  
  // State management for scenarios, states, and visualization
  const scenarioState = useScenarioState("testscenario");

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
  
  // Count pending verifications
  const pendingVerifications = transcript.messages.filter(
    m => m.requiresVerification && !m.isVerified
  ).length;
  
  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-0">
            <div className="h-full">
              {/* Display verification banner if needed */}
              {pendingVerifications > 0 && (
                <div className="max-w-5xl mx-auto px-4 pt-2">
                  <VerificationBanner 
                    isVisible={pendingVerifications > 0}
                    pendingVerifications={pendingVerifications}
                  />
                </div>
              )}
              
              {/* Main content section with transcript panel as the main view */}
              {scenarioState.loadedStateMachine && (
                <div className="h-full">
                  {/* Directly embed the transcript panel without tabs */}
                  <div className="h-full" ref={transcriptRef}>
                    <TranscriptPanel 
                      activeScenario={scenarioState.selectedStateMachine} 
                      jsonVisualization={jsonVisualization}
                    />
                  </div>
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
      <SensitiveFieldDetailsDialog 
        showSensitiveFieldDetails={scenarioState.showSensitiveFieldDetails} 
        handleCloseSensitiveDetails={scenarioState.handleCloseSensitiveDetails} 
      />
    </div>
  );
};

export default TestScenario;
