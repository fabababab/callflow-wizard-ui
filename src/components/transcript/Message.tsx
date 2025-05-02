
import React from 'react';
import { Badge } from '@/components/ui/badge';
import AISuggestions, { AISuggestion } from './AISuggestion';

export type MessageSender = 'agent' | 'customer';

export type Message = {
  id: number;
  text: string;
  sender: MessageSender;
  timestamp: string;
  suggestions?: AISuggestion[];
};

interface MessageProps {
  message: Message;
  onAcceptSuggestion: (suggestionId: number, messageId: number) => void;
  onRejectSuggestion: (suggestionId: number, messageId: number) => void;
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  onAcceptSuggestion, 
  onRejectSuggestion 
}) => {
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
        
        {message.suggestions && message.suggestions.length > 0 && (
          <AISuggestions 
            suggestions={message.suggestions}
            messageId={message.id}
            onAccept={onAcceptSuggestion}
            onReject={onRejectSuggestion}
          />
        )}
      </div>
    </div>
  );
};

export default Message;
