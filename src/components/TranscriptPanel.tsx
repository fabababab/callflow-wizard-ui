
import React from 'react';
import TranscriptHeader from './transcript/TranscriptHeader';
import TranscriptFooter from './transcript/TranscriptFooter';
import ChatMessages from './TestScenario/ChatMessages';
import { ScenarioType } from './ScenarioSelector';
import { useTranscript } from '@/hooks/useTranscript';
import { useConversationState } from '@/hooks/useConversationState';

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
  jsonVisualization: any;
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
        onViewJsonClick={jsonVisualization.toggleJsonDialog}
        onSwitchView={jsonVisualization.toggleJsonView}
        onMakeMindMap={() => {}}
        onEndCall={transcript.handleHangUpCall}
        onStartCall={transcript.handleCall}
        showJsonView={jsonVisualization.showJsonView}
        resetConversation={transcript.resetConversation}
        onValidateAll={() => {}}
      />
      
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        {jsonVisualization.showJsonView ? (
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
        awaitingUserResponse={transcript.awaitingUserResponse}
        onShowNachbearbeitung={transcript.showNachbearbeitungSummary}
        callActive={transcript.callActive}
      />
      
      {jsonVisualization.jsonDialog}
    </div>
  );
};

export default TranscriptPanel;
