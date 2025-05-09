
import { useEffect } from 'react';

interface MessageUpdatesProps {
  lastMessageUpdate: Date | null;
  setLastTranscriptUpdate: (date: Date | string) => void;  // Accept both Date and string
}

export function useMessageUpdates({
  lastMessageUpdate,
  setLastTranscriptUpdate
}: MessageUpdatesProps) {
  // Update when messages update
  useEffect(() => {
    if (lastMessageUpdate) {
      console.log("Message update detected, updating transcript:", lastMessageUpdate);
      setLastTranscriptUpdate(lastMessageUpdate);
    }
  }, [lastMessageUpdate, setLastTranscriptUpdate]);
}
