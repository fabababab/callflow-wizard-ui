
import React from 'react';
import type { MessageSender, Message as MessageInterface } from './MessageTypes';
import { ValidationStatus } from '@/data/scenarioData';
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
  
  // Debug logging for verification status
  React.useEffect(() => {
    if (message.requiresVerification) {
      console.log(`Message ${message.id} requires verification. Current status: ${message.isVerified ? 'Verified' : 'Not verified'}`);
    }
  }, [message.id, message.requiresVerification, message.isVerified]);
  
  // Handler for inline module completion
  const handleInlineModuleComplete = (moduleId: string, result: any) => {
    console.log(`Module completed for message ${message.id}`, result);
    if (onModuleComplete) {
      onModuleComplete(message.id, moduleId, result);
    }
  };

  // Determine if message has verification features
  const hasVerificationFeatures = message.requiresVerification || message.isVerified || (message.sensitiveData && message.sensitiveData.length > 0);

  return (
    <div 
      className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'} mb-4`} 
      key={`message-${message.id}`}
    >
      <div
        className={`rounded-lg max-w-[85%] p-3 shadow-sm 
          ${message.sender === 'agent'
            ? 'bg-primary text-primary-foreground ml-auto'
            : message.sender === 'customer' 
            ? `bg-secondary text-secondary-foreground mr-auto ${hasVerificationFeatures ? 'border-l-4 border-amber-300/60' : ''}` 
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
