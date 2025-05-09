
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Message from './Message';
import { MessageType } from '@/components/transcript/MessageTypes';

interface SystemMessageGroupProps {
  messages: MessageType[];
}

const SystemMessageGroup: React.FC<SystemMessageGroupProps> = ({ messages }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Improved filtering - only filter out very specific system messages
  const systemOnlyMessages = messages.filter(message => {
    // Only filter out call accepted messages
    return !message.text.includes("Call accepted from");
  });
  
  // Only show the first message text in the collapsed view
  const summaryText = systemOnlyMessages.length > 0 
    ? `${systemOnlyMessages.length} system messages: ${systemOnlyMessages[0]?.text || ''}${systemOnlyMessages.length > 1 ? '...' : ''}`
    : 'System messages';
  
  // Don't render at all if we have no messages after filtering
  if (systemOnlyMessages.length === 0) {
    return null;
  }
  
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
              Show all {systemOnlyMessages.length} messages
            </>
          )}
        </button>
      </div>
      
      {!isExpanded ? (
        <p className="italic">{summaryText}</p>
      ) : (
        <div className="space-y-2 pt-2">
          {systemOnlyMessages.map((message, index) => (
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
