
import React from 'react';
import { Button } from '@/components/ui/button';
import { PhoneCall, PhoneOff, RefreshCcw, Clock } from 'lucide-react';

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
    <div className="flex items-center gap-4 flex-wrap">
      {!callActive ? (
        <Button 
          onClick={onStartCall} 
          className="flex items-center gap-1"
        >
          <PhoneCall size={16} />
          Start Test Call
        </Button>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium flex items-center gap-1">
            <Clock size={14} className="text-red-500" />
            {elapsedTime}
          </span>
          <Button 
            onClick={onEndCall} 
            variant="destructive"
            className="flex items-center gap-1"
          >
            <PhoneOff size={16} />
            End Test Call
          </Button>
          <Button 
            onClick={onResetScenario}
            variant="outline" 
            className="flex items-center gap-1"
          >
            <RefreshCcw size={16} />
            Reset Scenario
          </Button>
        </div>
      )}
    </div>
  );
};

export default CallControl;
