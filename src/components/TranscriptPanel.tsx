
import React, { useEffect } from 'react';
import { useTranscript } from '@/hooks/useTranscript';
import { ScenarioType } from '@/components/ScenarioSelector';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessages from '@/components/TestScenario/ChatMessages';
import { useConversationSummary } from '@/hooks/useConversationSummary';
import { useTranscriptTimer } from '@/hooks/useTranscriptTimer';
import { useJsonVisualization } from '@/hooks/useJsonVisualization';
import { useScenarioManagement } from '@/hooks/useScenarioManagement';
import TranscriptHeader from '@/components/transcript/TranscriptHeader';
import TranscriptFooter from '@/components/transcript/TranscriptFooter';
import VerificationBanner from '@/components/transcript/VerificationBanner';
import JsonVisualizationDialog from '@/components/transcript/JsonVisualizationDialog';
import ModuleDisplay from '@/components/transcript/ModuleDisplay';

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  activeScenario
}) => {
  // Use the transcript hook with the active scenario
  const transcript = useTranscript(activeScenario);
  const { generateSummary } = useConversationSummary();
  const elapsedTime = useTranscriptTimer(transcript.callActive);
  const jsonVisualization = useJsonVisualization(activeScenario);
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
  const handleModuleComplete = (result: any) => {
    console.log('Module completed with result:', result);
    transcript.handleModuleComplete(result);
  };

  // Handle inline module completion
  const handleInlineModuleComplete = (messageId: string, moduleId: string, result: any) => {
    transcript.handleInlineModuleComplete(messageId, moduleId, result);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with call controls */}
      <TranscriptHeader 
        activeScenario={activeScenario}
        currentState={transcript.currentState}
        elapsedTime={elapsedTime}
        callActive={transcript.callActive}
        handleCall={transcript.handleCall}
        handleHangUpCall={transcript.handleHangUpCall}
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
      
      {/* Footer with scenario selector */}
      <TranscriptFooter 
        activeScenario={activeScenario}
        onSelectScenario={scenarioManagement.handleScenarioChange}
        resetConversation={transcript.resetConversation}
        viewJson={jsonVisualization.handleViewJson}
        isLoadingJson={jsonVisualization.isLoadingJson}
      />
      
      {/* JSON visualization dialog */}
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
    </div>
  );
}

export default TranscriptPanel;
