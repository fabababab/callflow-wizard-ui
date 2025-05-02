
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import AISuggestions, { AISuggestion } from './AISuggestion';

export type MessageSender = 'agent' | 'customer';

export type Message = {
  id: number;
  text: string;
  sender: MessageSender;
  timestamp: string;
  suggestions?: AISuggestion[];
  responseOptions?: string[];
};

interface MessageProps {
  message: Message;
  onAcceptSuggestion: (suggestionId: number, messageId: number) => void;
  onRejectSuggestion: (suggestionId: number, messageId: number) => void;
  onSelectResponse?: (response: string) => void;
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  onAcceptSuggestion, 
  onRejectSuggestion,
  onSelectResponse
}) => {
  const hasSuggestions = message.suggestions && message.suggestions.length > 0;
  const hasResponseOptions = message.responseOptions && message.responseOptions.length > 0;
  
  return (
    <div className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-lg max-w-[80%] p-3 shadow-sm 
          ${message.sender === 'agent'
            ? 'bg-primary text-primary-foreground ml-auto'
            : 'bg-secondary text-secondary-foreground mr-auto'}`}
      >
        <div className="flex justify-between items-center mb-1">
          <Badge
            variant="outline"
            className={`text-xs ${message.sender === 'agent' ? 'bg-primary/20' : 'bg-secondary/20'}`}
          >
            {message.sender === 'agent' ? 'You' : 'Customer'}
          </Badge>
          <span className="text-xs opacity-70">{message.timestamp}</span>
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
        
        {/* Display response options if available and message is from customer */}
        {hasResponseOptions && message.sender === 'customer' && onSelectResponse && (
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
                  className="text-xs py-1 px-2 h-auto"
                  onClick={() => onSelectResponse(option)}
                >
                  {option}
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
