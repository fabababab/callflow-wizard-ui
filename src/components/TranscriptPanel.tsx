
import React from 'react';
import TranscriptHeader from './transcript/TranscriptHeader';
import TranscriptFooter from './transcript/TranscriptFooter';
import ChatMessages from './TestScenario/ChatMessages';
import { ScenarioType } from './ScenarioSelector';
import { useTranscript } from '@/hooks/useTranscript';
import { useConversationState } from '@/hooks/useConversationState';

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
  jsonVisualization?: any;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ activeScenario, jsonVisualization }) => {
  // Get conversation state for used responses
  const conversationState = useConversationState();

  // Get transcript functionality
  const transcript = useTranscript(activeScenario);
  
  return (
    <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
      <TranscriptHeader 
        activeScenario={activeScenario}
        callActive={transcript.callActive}
        handleCall={transcript.handleCall}
        handleHangUpCall={transcript.handleHangUpCall}
        resetConversation={transcript.resetConversation}
        currentState={transcript.currentState}
        elapsedTime={transcript.elapsedTime}
        // These optional props are passed only if jsonVisualization is available
        onViewJsonClick={jsonVisualization?.toggleJsonDialog}
        onSwitchView={jsonVisualization?.toggleJsonView}
        showJsonView={jsonVisualization?.showJsonView}
        onMakeMindMap={() => {}}
        onValidateAll={() => {}}
      />
      
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        {jsonVisualization?.showJsonView ? (
          jsonVisualization.jsonComponent
        ) : (
          <ChatMessages 
            messages={transcript.messages}
            isAgentMode={true}
            onSelectResponse={transcript.handleSelectResponse}
            onValidateSensitiveData={transcript.handleValidateSensitiveData}
            onVerifySystemCheck={transcript.handleVerifySystemCheck}
            messagesEndRef={transcript.messagesEndRef}
            onModuleComplete={transcript.handleInlineModuleComplete}
            usedResponseOptions={conversationState.usedResponseOptions}
            processedStates={conversationState.processedStates}
            currentState={transcript.currentState}
          />
        )}
      </div>
      
      <TranscriptFooter 
        activeScenario={activeScenario}
        callActive={transcript.callActive}
        awaitingUserResponse={transcript.awaitingUserResponse}
        onShowNachbearbeitung={transcript.showNachbearbeitungSummary}
        viewJson={jsonVisualization?.toggleJsonDialog}
        isLoadingJson={jsonVisualization?.isLoadingJson}
        resetConversation={transcript.resetConversation}
      />
      
      {jsonVisualization?.jsonDialog}
    </div>
  );
};

export default TranscriptPanel;
