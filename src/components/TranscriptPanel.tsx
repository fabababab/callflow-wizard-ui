import React, { useEffect } from 'react';
import { useTranscript } from '@/hooks/useTranscript';
import { ScenarioType } from '@/components/ScenarioSelector';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessages from '@/components/TestScenario/ChatMessages';
import { useConversationSummary } from '@/hooks/useConversationSummary';
import { useTranscriptTimer } from '@/hooks/useTranscriptTimer';
import { useScenarioManagement } from '@/hooks/useScenarioManagement';
import TranscriptHeader from '@/components/transcript/TranscriptHeader';
import VerificationBanner from '@/components/transcript/VerificationBanner';
import JsonVisualizationDialog from '@/components/transcript/JsonVisualizationDialog';
import ModuleDisplay from '@/components/transcript/ModuleDisplay';
import { StateMachine } from '@/utils/stateMachineLoader';

// Define type for selected state details
interface SelectedStateDetails {
  id: string;
  data: Record<string, unknown>;
}

// Define type for JsonVisualization
interface JsonVisualization {
  handleViewJson: () => void;
  isLoadingJson: boolean;
  jsonDialogOpen: boolean;
  setJsonDialogOpen: (open: boolean) => void;
  dialogViewMode: "json" | "visualization";
  handleViewModeToggle: (mode: "json" | "visualization") => void;
  jsonContent: string;
  loadedStateMachine: StateMachine | null;
  selectedState: SelectedStateDetails | null;
  handleStateSelection: (state: string) => void;
}

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
  jsonVisualization?: JsonVisualization;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  activeScenario,
  jsonVisualization
}) => {
  // Use the transcript hook with the active scenario
  const transcript = useTranscript(activeScenario);
  const { generateSummary } = useConversationSummary();
  const elapsedTime = useTranscriptTimer(transcript.callActive);
  const scenarioManagement = useScenarioManagement(activeScenario);
  
  // Update summary when scenario changes
  useEffect(() => {
    generateSummary(activeScenario);
  }, [activeScenario, generateSummary]);

  // Scroll to bottom whenever messages are updated
  useEffect(() => {
    if (transcript.messagesEndRef.current) {
      transcript.messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [transcript.lastTranscriptUpdate]);
  
  // Handle module completion
  const handleModuleComplete = (result: Record<string, unknown>) => {
    console.log('Module completed with result:', result);
    transcript.handleModuleComplete(result);
  };

  // Handle inline module completion
  const handleInlineModuleComplete = (messageId: string, moduleId: string, result: Record<string, unknown>) => {
    transcript.handleInlineModuleComplete(messageId, moduleId, result);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with call control */}
      <TranscriptHeader 
        activeScenario={activeScenario}
        currentState={transcript.currentState}
        elapsedTime={elapsedTime}
        callActive={transcript.callActive}
        handleCall={transcript.handleCall}
        handleHangUpCall={transcript.handleHangUpCall}
        onSelectScenario={scenarioManagement.handleScenarioChange}
        viewJson={jsonVisualization ? jsonVisualization.handleViewJson : undefined}
        isLoadingJson={jsonVisualization ? jsonVisualization.isLoadingJson : false}
        resetConversation={transcript.resetConversation}
      />
      
      {/* Main content area with messages */}
      <div className="flex-grow overflow-auto relative">
        <ScrollArea className="h-full p-4">
          {/* Verification banner */}
          <VerificationBanner isVisible={transcript.verificationBlocking} />
          
          {/* Chat messages */}
          <ChatMessages
            messages={transcript.messages}
            onSelectResponse={transcript.handleSelectResponse}
            onVerifySystemCheck={transcript.handleVerifySystemCheck}
            onValidateSensitiveData={transcript.handleValidateSensitiveData}
            messagesEndRef={transcript.messagesEndRef}
            onModuleComplete={handleInlineModuleComplete}
          />
          
          {/* Active module display */}
          <ModuleDisplay 
            activeModule={transcript.activeModule}
            currentState={transcript.currentState}
            stateData={transcript.stateData}
            onModuleComplete={handleModuleComplete}
            completeModule={transcript.completeModule}
          />
        </ScrollArea>
      </div>
      
      {/* JSON visualization dialog */}
      {jsonVisualization && (
        <JsonVisualizationDialog 
          open={jsonVisualization.jsonDialogOpen}
          onOpenChange={jsonVisualization.setJsonDialogOpen}
          dialogViewMode={jsonVisualization.dialogViewMode}
          handleViewModeToggle={jsonVisualization.handleViewModeToggle}
          jsonContent={jsonVisualization.jsonContent}
          loadedStateMachine={jsonVisualization.loadedStateMachine}
          currentState={transcript.currentState}
          activeScenario={activeScenario}
          selectedState={jsonVisualization.selectedState}
          onStateClick={jsonVisualization.handleStateSelection}
        />
      )}
    </div>
  );
}

export default TranscriptPanel;
