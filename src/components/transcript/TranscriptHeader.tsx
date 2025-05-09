
import React from 'react';
import { FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScenarioType } from '@/components/ScenarioSelector';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CallControl from '@/components/TestScenario/CallControl';

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
  const scenarios: ScenarioType[] = ['testscenario', 'verificationFlow', 'contractManagement', 'productInfo'];
  
  console.log('TranscriptHeader: callActive =', callActive, 'elapsedTime =', elapsedTime);
  
  return <div className="p-4 bg-white border-b">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Transcript</h2>
            {/* Scenario selector as a pill dropdown */}
            <Select value={activeScenario} onValueChange={value => onSelectScenario && onSelectScenario(value as ScenarioType)}>
              <SelectTrigger className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center h-auto w-auto border-none">
                <SelectValue placeholder="Select scenario">{activeScenario}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {scenarios.map(scenario => <SelectItem key={scenario} value={scenario}>
                      {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
                    </SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {/* Current state pill */}
            {currentState && <div className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <span>State: {currentState}</span>
              </div>}
            
            {/* Updated status indicator */}
            <div className="text-blue-500 flex items-center gap-1 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Updated</span>
            </div>
            
            <span className="text-gray-500 text-sm">Agent call transcript</span>
          </div>
          
          {/* Call control section with timer - Now aligned to the right */}
          <div className="flex items-center gap-4">
            <CallControl callActive={callActive} elapsedTime={elapsedTime} onStartCall={handleCall} onEndCall={handleHangUpCall} onResetScenario={resetConversation} />
            
            {/* JSON Visualization button */}
            {viewJson && <Button variant="outline" size="icon" className="h-12 w-12 rounded-md border-2 bg-white shadow-sm" onClick={viewJson} disabled={isLoadingJson} title="View JSON">
                <FileText size={20} />
              </Button>}
            
            {/* Chat button */}
            
          </div>
        </div>
      </div>
    </div>;
};

export default TranscriptHeader;
