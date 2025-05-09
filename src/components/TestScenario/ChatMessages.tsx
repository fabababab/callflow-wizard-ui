
import React from 'react';
import Message, { Message as MessageType } from '../transcript/Message';

interface ChatMessagesProps {
  messages: MessageType[];
  isAgentMode?: boolean;
  onSelectResponse?: (response: string) => void;
  onVerifySystemCheck?: (messageId: string) => void;
  onValidateSensitiveData?: (messageId: string, fieldId: string, status: string, notes?: string) => void; 
  messagesEndRef?: React.RefObject<HTMLDivElement>;
  onModuleComplete?: (moduleId: string, result: any) => void;
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
  // If there are no messages, show empty state
  if (!messages.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-sm text-gray-500">
            Start a conversation to see messages here
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 pb-4">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onAcceptSuggestion={(suggestionId, messageId) => {}}
          onRejectSuggestion={(suggestionId, messageId) => {}}
          onSelectResponse={onSelectResponse}
          onVerifySystemCheck={onVerifySystemCheck}
          onValidateSensitiveData={onValidateSensitiveData}
          isAgentMode={isAgentMode}
          onModuleComplete={onModuleComplete}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
