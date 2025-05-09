
import React from 'react';
import type { MessageSender, Message as MessageInterface } from './MessageTypes';
import { ValidationStatus } from '@/data/scenarioData';
import { AISuggestion } from './AISuggestion';
import MessageHeader from './MessageHeader';
import MessageContent from './MessageContent';
import MessageResponseOptions from './MessageResponseOptions';
import AISuggestions from './AISuggestion';
import MessageInlineModule from './MessageInlineModule';

interface MessageProps {
  message: MessageInterface;
  onAcceptSuggestion: (suggestionId: string, messageId: string) => void;
  onRejectSuggestion: (suggestionId: string, messageId: string) => void;
  onSelectResponse?: (response: string) => void;
  onValidateSensitiveData?: (messageId: string, fieldId: string, status: ValidationStatus, notes?: string) => void;
  onVerifySystemCheck?: (messageId: string) => void;
  isAgentMode?: boolean;
  onModuleComplete?: (messageId: string, moduleId: string, result: any) => void;
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  onAcceptSuggestion,
  onRejectSuggestion,
  onSelectResponse,
  onValidateSensitiveData,
  onVerifySystemCheck,
  isAgentMode = true,
  onModuleComplete
}) => {
  const hasSuggestions = message.suggestions && message.suggestions.length > 0;
  const hasResponseOptions = message.responseOptions && message.responseOptions.length > 0;
  const hasInlineModule = message.inlineModule !== undefined;
  
  // Debug logging for response options
  React.useEffect(() => {
    if (hasResponseOptions) {
      console.log('Message has response options:', {
        messageId: message.id,
        options: message.responseOptions
      });
    }
  }, [message.id, message.responseOptions, hasResponseOptions]);
  
  // Handler for inline module completion
  const handleInlineModuleComplete = (moduleId: string, result: any) => {
    console.log(`Module completed for message ${message.id}`, result);
    if (onModuleComplete) {
      onModuleComplete(message.id, moduleId, result);
    }
  };

  return (
    <div className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`rounded-lg max-w-[85%] p-3 shadow-sm 
          ${message.sender === 'agent'
            ? 'bg-primary text-primary-foreground ml-auto'
            : message.sender === 'customer' 
            ? 'bg-secondary text-secondary-foreground mr-auto' 
            : 'bg-muted text-center italic text-sm w-full'}`}
      >
        <MessageHeader sender={message.sender} timestamp={message.timestamp} />
        
        <MessageContent 
          text={message.text}
          sender={message.sender}
          numberInput={message.numberInput}
          requiresVerification={message.requiresVerification}
          isVerified={message.isVerified}
          messageId={message.id}
          sensitiveData={message.sensitiveData}
          onValidateSensitiveData={onValidateSensitiveData}
          onVerifySystemCheck={onVerifySystemCheck}
        />
        
        {/* Display response options */}
        {hasResponseOptions && isAgentMode && message.responseOptions && onSelectResponse && (
          <MessageResponseOptions 
            responseOptions={message.responseOptions} 
            onSelectResponse={onSelectResponse}
          />
        )}
        
        {/* Display AI suggestions */}
        {hasSuggestions && isAgentMode && (
          <div className="mt-3 pt-2 border-t border-gray-300/20">
            <AISuggestions 
              suggestions={message.suggestions || []} 
              messageId={message.id}
              onAccept={onAcceptSuggestion}
              onReject={onRejectSuggestion}
            />
          </div>
        )}
      </div>

      {/* Display inline module */}
      {hasInlineModule && message.inlineModule && (
        <MessageInlineModule 
          moduleConfig={message.inlineModule}
          onModuleComplete={(result) => handleInlineModuleComplete(message.inlineModule!.id, result)}
        />
      )}
    </div>
  );
};

export default Message;
