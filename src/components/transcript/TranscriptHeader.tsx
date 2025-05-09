import React from 'react';
import { Clock, Copy, MessageSquare, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScenarioType } from '@/components/ScenarioSelector';
import StateMachineSelector from '@/components/StateMachineSelector';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface TranscriptHeaderProps {
  activeScenario: ScenarioType;
  currentState?: string;
  elapsedTime: string;
  callActive: boolean;
  handleCall: () => void;
  handleHangUpCall: () => void;
  onSelectScenario?: (scenario: ScenarioType) => void;
  viewJson?: () => void;
  isLoadingJson?: boolean;
  resetConversation?: () => void;
}

const TranscriptHeader: React.FC<TranscriptHeaderProps> = ({
  activeScenario,
  currentState,
  elapsedTime,
  callActive,
  handleCall,
  handleHangUpCall,
  onSelectScenario,
  viewJson,
  isLoadingJson = false,
  resetConversation
}) => {
  // List of available scenarios for the dropdown
  const scenarios: ScenarioType[] = [
    'testscenario',
    'scenario2',
    'verification',
    'bankDetails',
    'accountHistory',
    'physioTherapy',
    'paymentReminder',
    'insurancePackage',
    'basicTutorial',
    'customerSupport',
    'accountVerification'
  ];

  return (
    <div className="p-4 bg-white border-b">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-2">Transcript</h2>
          <div className="flex items-center gap-4">
            {/* Scenario selector as a pill dropdown */}
            <Select
              value={activeScenario}
              onValueChange={(value) => onSelectScenario && onSelectScenario(value as ScenarioType)}
            >
              <SelectTrigger className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center h-auto w-auto border-none">
                <SelectValue placeholder="Select scenario">{activeScenario}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {scenarios.map((scenario) => (
                    <SelectItem key={scenario} value={scenario}>
                      {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
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
          
          {/* Reset button */}
          {resetConversation && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9"
              onClick={resetConversation}
              title="Reset conversation"
            >
              <RefreshCw size={18} />
            </Button>
          )}
          
          {/* Copy button */}
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Copy size={18} />
          </Button>
          
          {/* JSON Visualization button */}
          {viewJson && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={viewJson}
              disabled={isLoadingJson}
              title="View JSON"
            >
              <FileText size={18} />
            </Button>
          )}
          
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
