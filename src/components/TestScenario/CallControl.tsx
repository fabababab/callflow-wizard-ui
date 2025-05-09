
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, PhoneCall, PhoneOff, RefreshCcw } from 'lucide-react';

interface CallControlProps {
  callActive: boolean;
  elapsedTime: string;
  onStartCall: () => void;
  onEndCall: () => void;
  onResetScenario?: () => void;
}

const CallControl: React.FC<CallControlProps> = ({
  callActive,
  elapsedTime,
  onStartCall,
  onEndCall,
  onResetScenario,
}) => {
  return (
    <div className="flex items-center gap-4">
      {/* Timer display when call is active */}
      {callActive && (
        <div className="flex items-center gap-1 border rounded-full px-4 py-2 bg-white shadow-sm">
          <Clock size={16} className="text-red-500" />
          <span className="font-medium">{elapsedTime}</span>
        </div>
      )}
      
      {!callActive ? (
        <Button 
          onClick={onStartCall} 
          className="flex items-center gap-2 h-12 px-8 py-2 rounded-xl border-2 border-black shadow-md bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <PhoneCall size={20} />
          Start Call
        </Button>
      ) : (
        <Button 
          onClick={onEndCall} 
          variant="destructive"
          className="flex items-center gap-2 h-12 px-8 py-2 rounded-xl border-2 border-black shadow-md"
          size="lg"
        >
          <PhoneOff size={20} />
          End Call
        </Button>
      )}
      
      {onResetScenario && (
        <Button
          onClick={onResetScenario}
          variant="outline"
          size="icon"
          className="h-10 w-10"
          title="Reset scenario"
        >
          <RefreshCcw size={16} />
        </Button>
      )}
    </div>
  );
};

export default CallControl;
