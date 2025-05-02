
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronRight } from 'lucide-react';
import AISuggestions, { AISuggestion } from './AISuggestion';

export type MessageSender = 'agent' | 'customer' | 'system';

export type Message = {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date | string;
  suggestions?: AISuggestion[];
  responseOptions?: string[];
  isAccepted?: boolean;
  isRejected?: boolean;
  systemType?: 'info' | 'warning' | 'error' | 'success';
};

interface MessageProps {
  message: Message;
  onAcceptSuggestion: (suggestionId: string, messageId: string) => void;
  onRejectSuggestion: (suggestionId: string, messageId: string) => void;
  onSelectResponse?: (response: string) => void;
  isAgentMode?: boolean;
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  onAcceptSuggestion, 
  onRejectSuggestion,
  onSelectResponse,
  isAgentMode = false
}) => {
  const hasSuggestions = message.suggestions && message.suggestions.length > 0;
  const hasResponseOptions = message.responseOptions && message.responseOptions.length > 0;
  
  return (
    <div className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`rounded-lg max-w-[85%] p-3 shadow-sm 
          ${message.sender === 'agent'
            ? 'bg-primary text-primary-foreground ml-auto'
            : message.sender === 'customer' 
            ? 'bg-secondary text-secondary-foreground mr-auto' 
            : 'bg-muted text-center italic text-sm'}`}
      >
        <div className="flex justify-between items-center mb-1">
          <Badge
            variant="outline"
            className={`text-xs ${message.sender === 'agent' ? 'bg-primary/20' : 'bg-secondary/20'}`}
          >
            {message.sender === 'agent' ? 'You' : 
             message.sender === 'customer' ? 'Customer' : 'System'}
          </Badge>
          <span className="text-xs opacity-70">
            {typeof message.timestamp === 'string' ? message.timestamp : message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        
        {/* Display AI suggestions if available */}
        {hasSuggestions && (
          <AISuggestions 
            suggestions={message.suggestions}
            messageId={message.id}
            onAccept={onAcceptSuggestion}
            onReject={onRejectSuggestion}
          />
        )}
        
        {/* Display response options based on who's speaking */}
        {hasResponseOptions && (
          (isAgentMode && message.sender === 'customer' || !isAgentMode && message.sender === 'agent') && 
          onSelectResponse && (
          <div className="mt-3 space-y-2 border-t border-gray-300/20 pt-2">
            <div className="text-xs flex items-center gap-1">
              <MessageSquare size={12} />
              <span>Quick Responses</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.responseOptions.map((option, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  className="text-xs py-1 px-2 h-auto flex items-center gap-1 group"
                  onClick={() => onSelectResponse(option)}
                >
                  <span>{option.length > 50 ? `${option.substring(0, 50)}...` : option}</span>
                  <ChevronRight size={12} className="opacity-50 group-hover:opacity-100" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
