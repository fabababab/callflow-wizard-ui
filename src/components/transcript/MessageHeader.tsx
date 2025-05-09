
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MessageSender } from './MessageTypes';

interface MessageHeaderProps {
  sender: MessageSender;
  timestamp: Date | string;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ sender, timestamp }) => {
  return (
    <div className="flex justify-between items-center mb-1">
      <Badge
        variant="outline"
        className={`text-xs text-white ${sender === 'agent' ? 'bg-primary/20' : 'bg-secondary/20'}`}
      >
        {sender === 'agent' ? 'You' : 
         sender === 'customer' ? 'Customer' : 'System'}
      </Badge>
      <span className="text-xs opacity-70">
        {typeof timestamp === 'string' ? timestamp : timestamp.toLocaleTimeString()}
      </span>
    </div>
  );
};

export default MessageHeader;
