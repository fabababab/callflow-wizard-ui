
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Message as MessageType } from './Message';

interface SystemMessageGroupProps {
  messages: MessageType[];
}

const SystemMessageGroup: React.FC<SystemMessageGroupProps> = ({ messages }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Only show the first message text in the collapsed view
  const summaryText = `${messages.length} system messages: ${messages[0].text}${messages.length > 1 ? '...' : ''}`;
  
  return (
    <div className="rounded-lg bg-muted p-3 text-sm mb-4">
      <div className="flex justify-between items-center mb-1">
        <Badge variant="outline" className="bg-muted/20">
          System
        </Badge>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs flex items-center gap-1 hover:underline"
        >
          {isExpanded ? (
            <>
              <ChevronDown size={14} />
              Hide details
            </>
          ) : (
            <>
              <ChevronRight size={14} />
              Show all {messages.length} messages
            </>
          )}
        </button>
      </div>
      
      {!isExpanded ? (
        <p className="italic">{summaryText}</p>
      ) : (
        <div className="space-y-2 pt-2">
          {messages.map((message, index) => (
            <div key={message.id} className="pl-2 border-l-2 border-muted-foreground/20">
              <p className="text-xs font-medium">System message {index + 1}</p>
              <p className="italic">{message.text}</p>
              {/* Display timestamp */}
              <p className="text-xs text-muted-foreground mt-1">
                {typeof message.timestamp === 'string' 
                  ? message.timestamp 
                  : message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SystemMessageGroup;
