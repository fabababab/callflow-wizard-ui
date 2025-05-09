
import React from 'react';
import { Button } from '@/components/ui/button';
import { PhoneCall, PhoneOff, RefreshCcw } from 'lucide-react';

interface CallControlProps {
  callActive: boolean;
  elapsedTime: string;
  onStartCall: () => void;
  onEndCall: () => void;
  onResetScenario: () => void;
}

const CallControl: React.FC<CallControlProps> = ({
  callActive,
  elapsedTime,
  onStartCall,
  onEndCall,
  onResetScenario,
}) => {
  return (
    <div className="flex items-center gap-2">
      {!callActive ? (
        <Button 
          onClick={onStartCall} 
          className="flex items-center gap-1 h-8"
          variant="default"
          size="sm"
        >
          <PhoneCall size={16} />
          Start Call
        </Button>
      ) : (
        <>
          <span className="text-sm font-medium mr-2">{elapsedTime}</span>
          <Button 
            onClick={onEndCall} 
            variant="destructive"
            className="flex items-center gap-1 h-8"
            size="sm"
          >
            <PhoneOff size={16} />
            End Call
          </Button>
        </>
      )}
    </div>
  );
};

export default CallControl;
