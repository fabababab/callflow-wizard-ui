
import { useEffect, RefObject } from 'react';

interface MessagesScrollingProps {
  messagesEndRef: RefObject<HTMLDivElement>;
  lastTranscriptUpdate: Date | string;  // Accept both Date and string types
}

export function useMessagesScrolling({ 
  messagesEndRef, 
  lastTranscriptUpdate 
}: MessagesScrollingProps) {
  // Scroll to bottom whenever messages are updated
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [lastTranscriptUpdate, messagesEndRef]);
}
