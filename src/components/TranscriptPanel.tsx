
import React, { useEffect } from 'react';
import { useTranscript } from '@/hooks/useTranscript';
import { ScenarioType } from '@/components/ScenarioSelector';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessages from '@/components/TestScenario/ChatMessages';
import { useConversationSummary } from '@/hooks/useConversationSummary';
import { useTranscriptTimer } from '@/hooks/useTranscriptTimer';
import { useScenarioManagement } from '@/hooks/useScenarioManagement';
import TranscriptHeader from '@/components/transcript/TranscriptHeader';
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
  dialogViewMode: "json" | "visualization" | "modules";
  handleViewModeToggle: (mode: "json" | "visualization" | "modules") => void;
  jsonContent: string;
  loadedStateMachine: StateMachine | null;
  selectedState: SelectedStateDetails | null;
  handleStateSelection: (state: string) => void;
  handleJumpToState: (stateId: string) => void;
  handleSensitiveFieldClick: (field: any) => void;
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

  // Debug message count
  useEffect(() => {
    console.log(`Message count: ${transcript.messages.length}`);
    
    // Log the first few messages for debugging
    if (transcript.messages.length > 0) {
      console.log('First messages:', transcript.messages.slice(0, 3));
    }
  }, [transcript.messages]);

  // Force immediate scroll to bottom when messages update
  useEffect(() => {
    if (transcript.messagesEndRef.current) {
      transcript.messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [transcript.messages, transcript.lastTranscriptUpdate]);
  
  // Handle module completion
  const handleModuleComplete = (result: Record<string, unknown>) => {
    console.log('Module completed with result:', result);
    transcript.handleModuleComplete(result);
  };

  // Handle inline module completion
  const handleInlineModuleComplete = (messageId: string, moduleId: string, result: Record<string, unknown>) => {
    console.log('Inline module completed:', { messageId, moduleId, result });
    transcript.handleInlineModuleComplete(messageId, moduleId, result);
  };
  
  if (!jsonVisualization) {
    return null;
  }
  
  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Header with call control */}
      <TranscriptHeader 
        activeScenario={activeScenario}
        currentState={transcript.currentState}
        elapsedTime={elapsedTime}
        callActive={transcript.callActive}
        handleCall={transcript.handleCall}
        handleHangUpCall={transcript.handleHangUpCall}
        onSelectScenario={scenarioManagement.handleScenarioChange}
        viewJson={jsonVisualization.handleViewJson}
        isLoadingJson={jsonVisualization.isLoadingJson}
        resetConversation={transcript.resetConversation}
      />
      
      {/* Transcript Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 bg-gray-50/50"
      >
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
        
        {/* Invisible element for scroll reference */}
        <div ref={transcript.messagesEndRef} />
      </div>
      
      {/* JSON Visualization Dialog with Jump to State functionality */}
      <JsonVisualizationDialog
        open={jsonVisualization.jsonDialogOpen}
        onOpenChange={jsonVisualization.setJsonDialogOpen}
        dialogViewMode={jsonVisualization.dialogViewMode}
        handleViewModeToggle={jsonVisualization.handleViewModeToggle}
        jsonContent={jsonVisualization.jsonContent}
        loadedStateMachine={jsonVisualization.loadedStateMachine}
        currentState={transcript.currentState || ""}
        activeScenario={activeScenario}
        selectedState={jsonVisualization.selectedState}
        onStateClick={jsonVisualization.handleStateSelection}
        onJumpToState={jsonVisualization.handleJumpToState}
        onSensitiveFieldClick={jsonVisualization.handleSensitiveFieldClick}
      />
    </div>
  );
}

export default TranscriptPanel;
