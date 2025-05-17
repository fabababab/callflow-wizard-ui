
import React, { useCallback, memo } from 'react';
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
  usedResponseOptions?: Set<string>;
  isFromProcessedState?: boolean;
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  onAcceptSuggestion,
  onRejectSuggestion,
  onSelectResponse,
  onValidateSensitiveData,
  onVerifySystemCheck,
  isAgentMode = true,
  onModuleComplete,
  usedResponseOptions = new Set(),
  isFromProcessedState = false
}) => {
  const hasSuggestions = message.suggestions && message.suggestions.length > 0;
  const hasResponseOptions = message.responseOptions && message.responseOptions.length > 0;
  const hasInlineModule = message.inlineModule !== undefined;
  
  // Handler for inline module completion - memoize to avoid unnecessary re-renders
  const handleInlineModuleComplete = useCallback((result: any) => {
    console.log(`Module completed for message ${message.id}`, result);
    if (onModuleComplete && message.inlineModule) {
      onModuleComplete(message.id, message.inlineModule.id, result);
    }
  }, [message.id, message.inlineModule, onModuleComplete]);

  // Determine if message has verification features
  const hasVerificationFeatures = message.requiresVerification || message.isVerified || (message.sensitiveData && message.sensitiveData.length > 0);
  
  // Handle border styling based on message type
  const getBorderStyle = () => {
    if (message.sender === 'customer' && hasVerificationFeatures) {
      return 'border-l-4 border-amber-300/60';
    } else if (message.inlineModule?.type === 'VERIFICATION') {
      return 'border-l-4 border-amber-300/60';
    }
    return '';
  };

  return (
    <>
      <div 
        className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'} mb-4 w-full transition-all duration-300`} 
        key={`message-container-${message.id}`}
      >
        <div
          className={`rounded-lg max-w-[85%] p-3 shadow-sm transition-all duration-300 ${message.sender === 'agent'
              ? 'bg-primary text-primary-foreground ml-auto'
              : message.sender === 'customer' 
              ? `bg-secondary text-secondary-foreground mr-auto ${getBorderStyle()}` 
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
          
          {/* Display response options with used options tracking */}
          {hasResponseOptions && isAgentMode && message.responseOptions && onSelectResponse && (
            <MessageResponseOptions 
              responseOptions={message.responseOptions} 
              onSelectResponse={onSelectResponse}
              usedOptions={usedResponseOptions}
              isFromProcessedState={isFromProcessedState}
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
      </div>

      {/* Display inline module - now works for all module types */}
      {hasInlineModule && message.inlineModule && (
        <div 
          className="w-full flex justify-end mb-4 transition-all duration-300" 
          key={`module-container-${message.id}-${message.inlineModule.id}`}
        >
          <MessageInlineModule 
            moduleConfig={message.inlineModule}
            onModuleComplete={handleInlineModuleComplete}
          />
        </div>
      )}
    </>
  );
};

export default memo(Message);
