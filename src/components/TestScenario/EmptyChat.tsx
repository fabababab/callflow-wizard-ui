
import React from 'react';
import { Button } from '@/components/ui/button';
import { PhoneCall, MessageSquare } from 'lucide-react';

interface EmptyChatProps {
  onStartCall: () => void;
}

const EmptyChat: React.FC<EmptyChatProps> = ({ onStartCall }) => {
  return (
    <div className="text-center p-6 text-muted-foreground">
      <MessageSquare className="mx-auto h-12 w-12 opacity-20 mb-3" />
      <p>Select a scenario and start a call to begin the conversation</p>
      <Button 
        onClick={onStartCall} 
        variant="default"
        size="lg"
        className="mt-5"
      >
        <PhoneCall size={16} className="mr-2" />
        Start Test Call
      </Button>
    </div>
  );
};

export default EmptyChat;
