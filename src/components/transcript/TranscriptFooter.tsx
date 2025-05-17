
import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScenarioSelector from '@/components/ScenarioSelector';
import { ScenarioType } from '@/components/ScenarioSelector';

interface TranscriptFooterProps {
  activeScenario: ScenarioType;
  onSelectScenario?: (scenario: ScenarioType) => void;
  resetConversation?: () => void;
  viewJson?: () => void;
  isLoadingJson?: boolean;
  callActive?: boolean;
  onShowNachbearbeitung?: () => void;
  awaitingUserResponse?: boolean;
}

const TranscriptFooter: React.FC<TranscriptFooterProps> = ({
  activeScenario,
  onSelectScenario,
  resetConversation,
  viewJson,
  isLoadingJson,
  callActive,
  onShowNachbearbeitung,
  awaitingUserResponse
}) => {
  return (
    <div className="border-t p-2 bg-gray-50">
      <div className="flex items-center">
        {onSelectScenario && (
          <ScenarioSelector 
            activeScenario={activeScenario} 
            onSelectScenario={onSelectScenario}
          />
        )}
        
        {/* Reset button */}
        {resetConversation && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetConversation} 
            className="ml-2"
            title="Reset conversation"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Reset
          </Button>
        )}
        
        {/* JSON button */}
        {viewJson && (
          <Button 
            variant="ghost" 
            size="default" 
            onClick={viewJson} 
            className="ml-auto flex items-center h-10"
            disabled={isLoadingJson}
          >
            <FileText className="h-4 w-4 mr-1" /> View JSON
          </Button>
        )}
        
        {/* Show additional buttons if needed based on new props */}
        {onShowNachbearbeitung && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowNachbearbeitung}
            className="ml-2"
            disabled={!awaitingUserResponse && !callActive}
          >
            Nachbearbeitung
          </Button>
        )}
      </div>
    </div>
  );
};

export default TranscriptFooter;
