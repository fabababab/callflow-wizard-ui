
import React, { useRef, useEffect } from 'react';
import { useTranscript } from '@/hooks/useTranscript';
import { ScenarioType } from '@/components/ScenarioSelector';
import TranscriptPanel from '@/components/TranscriptPanel';
import { useJsonVisualization } from '@/hooks/useJsonVisualization';
import { useScenarioState } from '@/hooks/useScenarioState';
import LoadingErrorStates from '@/components/test-scenario/LoadingErrorStates';
import SensitiveFieldDetailsDialog from '@/components/test-scenario/SensitiveFieldDetailsDialog';
import { useToast } from '@/hooks/use-toast';

const DashboardTranscriptPanel = () => {
  const transcriptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize with default scenario
  const scenarioState = useScenarioState("leistungsabdeckungPhysio");
  
  // Use the JSON visualization hook
  const jsonVisualization = useJsonVisualization(scenarioState.selectedStateMachine);
  
  // Load the transcript for the active scenario
  const transcript = useTranscript(scenarioState.selectedStateMachine);

  // Add notification when scenario is loaded
  useEffect(() => {
    if (scenarioState.loadedStateMachine) {
      toast({
        title: `${scenarioState.selectedStateMachine} loaded`,
        description: "The scenario has been loaded in the dashboard view",
        duration: 3000
      });
    }
  }, [scenarioState.loadedStateMachine, toast, scenarioState.selectedStateMachine]);

  return (
    <div className="h-full">
      {/* Main content section with transcript panel */}
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
        error={scenarioState.error} 
        hasStateMachine={!!scenarioState.loadedStateMachine} 
      />

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

export default DashboardTranscriptPanel;
