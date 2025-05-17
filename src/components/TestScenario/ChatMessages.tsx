
import React, { useState } from 'react';
import Message from '../transcript/Message';
import { Message as MessageType } from '../transcript/MessageTypes';
import { ValidationStatus } from '@/data/scenarioData';

interface ChatMessagesProps {
  messages: MessageType[];
  isAgentMode?: boolean;
  onSelectResponse?: (response: string) => void;
  onVerifySystemCheck?: (messageId: string) => void;
  onValidateSensitiveData?: (messageId: string, fieldId: string, status: ValidationStatus, notes?: string) => void; 
  messagesEndRef?: React.RefObject<HTMLDivElement>;
  onModuleComplete?: (messageId: string, moduleId: string, result: any) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isAgentMode = true,
  onSelectResponse,
  onVerifySystemCheck,
  onValidateSensitiveData,
  messagesEndRef,
  onModuleComplete
}) => {
  // Add state to track the most recently selected response
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  // If there are no messages, show empty state
  if (!messages.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-sm text-gray-500">
            Click "Start Call" to begin a conversation
          </p>
        </div>
      </div>
    );
  }

  // Handle response selection by calling the parent callback and updating our local state
  const handleResponseSelection = (response: string) => {
    console.log("ChatMessages: response selected", response);
    setSelectedResponse(response);
    if (onSelectResponse) {
      onSelectResponse(response);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onAcceptSuggestion={(suggestionId, messageId) => {}}
          onRejectSuggestion={(suggestionId, messageId) => {}}
          onSelectResponse={handleResponseSelection}
          onVerifySystemCheck={onVerifySystemCheck}
          onValidateSensitiveData={onValidateSensitiveData}
          isAgentMode={isAgentMode}
          onModuleComplete={onModuleComplete}
          selectedResponse={selectedResponse}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
