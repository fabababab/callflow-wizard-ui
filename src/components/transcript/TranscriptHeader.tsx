
import React from 'react';
import { Clock, Copy, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScenarioType } from '@/components/ScenarioSelector';

interface TranscriptHeaderProps {
  activeScenario: ScenarioType;
  currentState?: string;
  elapsedTime: string;
  callActive: boolean;
  handleCall: () => void;
  handleHangUpCall: () => void;
}

const TranscriptHeader: React.FC<TranscriptHeaderProps> = ({
  activeScenario,
  currentState,
  elapsedTime,
  callActive,
  handleCall,
  handleHangUpCall
}) => {
  return (
    <div className="p-4 bg-white border-b">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-2">Transcript</h2>
          <div className="flex items-center gap-4">
            {/* Scenario selector styled as a pill button */}
            <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              {activeScenario || 'No scenario'}
            </div>
            
            {/* Current state pill */}
            {currentState && (
              <div className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <span>State: {currentState}</span>
              </div>
            )}
            
            {/* Updated status indicator */}
            <div className="text-blue-500 flex items-center gap-1 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Updated</span>
            </div>
            
            <span className="text-gray-500 text-sm">Agent call transcript</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1 text-gray-700 mr-2">
            <Clock size={18} />
            <span>{elapsedTime}</span>
          </div>
          
          {/* Copy button */}
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Copy size={18} />
          </Button>
          
          {/* Call control button */}
          <Button 
            variant="destructive"
            onClick={callActive ? handleHangUpCall : handleCall}
            className="flex items-center gap-1"
          >
            {callActive ? <>End Call</> : <>Start Call</>}
          </Button>
          
          {/* Chat button */}
          <Button variant="outline" size="icon" className="h-9 w-9">
            <MessageSquare size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TranscriptHeader;
