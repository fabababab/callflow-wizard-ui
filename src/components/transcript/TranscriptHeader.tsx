
import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScenarioType } from '@/components/ScenarioSelector';
import CallControl from '@/components/TestScenario/CallControl';

interface TranscriptHeaderProps {
  activeScenario: ScenarioType;
  currentState: string;
  elapsedTime: string;
  callActive: boolean;
  handleCall: () => void;
  handleHangUpCall: () => void;
  viewJson?: () => void;
  isLoadingJson?: boolean;
}

const TranscriptHeader: React.FC<TranscriptHeaderProps> = ({
  activeScenario,
  currentState,
  elapsedTime,
  callActive,
  handleCall,
  handleHangUpCall,
  viewJson,
  isLoadingJson = false
}) => {
  return (
    <div className="border-b p-2 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">
            {activeScenario} - {currentState}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <CallControl
            callActive={callActive}
            elapsedTime={elapsedTime}
            onStartCall={handleCall}
            onEndCall={handleHangUpCall}
            onResetScenario={() => {}}
          />
          
          {/* JSON button moved from footer to header */}
          {viewJson && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={viewJson} 
              className="flex items-center"
              disabled={isLoadingJson}
            >
              <FileText className="h-4 w-4 mr-1" /> View JSON
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptHeader;
