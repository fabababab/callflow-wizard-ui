
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
      <p className="mb-2">Welcome to the Call Center Agent Simulator</p>
      <p className="mb-4 text-sm opacity-70">Select a scenario and start a call to begin handling customer inquiries</p>
      <Button 
        onClick={onStartCall} 
        variant="default"
        size="lg"
        className="mt-2"
      >
        <PhoneCall size={16} className="mr-2" />
        Answer Incoming Call
      </Button>
    </div>
  );
};

export default EmptyChat;
