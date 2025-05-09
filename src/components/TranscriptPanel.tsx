
import React, { useEffect, useState } from 'react';
import { useTranscript } from '@/hooks/useTranscript';
import { ScenarioType } from '@/components/ScenarioSelector';
import { Button } from '@/components/ui/button';
import { Shield, MessageCircle, Phone, PhoneOff, AlertTriangle, Mic, MicOff, RefreshCw, FileJson } from 'lucide-react';
import ChatMessages from '@/components/TestScenario/ChatMessages';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ScenarioSelector from './ScenarioSelector';
import ModuleContainer from '@/components/modules/ModuleContainer';

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  activeScenario
}) => {
  // Use the transcript hook with the active scenario
  const transcript = useTranscript(activeScenario);
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  
  // Scroll to bottom whenever messages are updated
  useEffect(() => {
    if (transcript.messagesEndRef.current) {
      transcript.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript.lastTranscriptUpdate]);

  // Function to handle scenario changes
  const handleScenarioChange = (newScenario: ScenarioType) => {
    if (activeScenario !== newScenario) {
      // Dispatch custom event for scenario change
      const event = new CustomEvent('scenario-change', { 
        detail: { scenario: newScenario } 
      });
      window.dispatchEvent(event);
    }
  };

  // Handle module completion
  const handleModuleComplete = (result: any) => {
    console.log('Module completed with result:', result);
    transcript.handleModuleComplete(result);
  };

  // Toggle JSON dialog visibility
  const toggleJsonDialog = () => {
    setShowJsonDialog(!showJsonDialog);
    
    // Dispatch event for JSON visualization
    const event = new CustomEvent('toggle-json-visualization', {
      detail: { visible: !showJsonDialog }
    });
    window.dispatchEvent(event);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-slate-50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Scenario selector - changing prop name from onScenarioChange to onSelectScenario */}
            <ScenarioSelector 
              activeScenario={activeScenario}
              onSelectScenario={handleScenarioChange}
            />
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={transcript.resetConversation}
              title="Reset conversation"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleJsonDialog}
              className="flex items-center gap-1"
            >
              <FileJson className="h-4 w-4 mr-1" />
              JSON
            </Button>
            
            <Button 
              size="sm" 
              variant={transcript.callActive ? "destructive" : "default"}
              onClick={transcript.handleCall}
            >
              {transcript.callActive ? (
                <>
                  <PhoneOff className="h-3.5 w-3.5 mr-1" /> End Call
                </>
              ) : (
                <>
                  <Phone className="h-3.5 w-3.5 mr-1" /> Start Call
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-grow p-4">
        {transcript.verificationBlocking && (
          <Card className="mb-4 bg-amber-50 border border-amber-200 shadow-sm">
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700">
                <Shield size={16} />
                <span className="text-sm font-medium">Verification required to continue</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs bg-white"
                onClick={() => transcript.handleVerifySystemCheck('system')}
              >
                Verify Identity
              </Button>
            </div>
          </Card>
        )}
        
        <ChatMessages 
          messages={transcript.messages}
          isAgentMode={true}
          onSelectResponse={transcript.handleSelectResponse}
          onVerifySystemCheck={transcript.handleVerifySystemCheck}
          onValidateSensitiveData={transcript.handleValidateSensitiveData}
          messagesEndRef={transcript.messagesEndRef}
          onModuleComplete={transcript.handleInlineModuleComplete}
        />
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex items-center justify-between pb-2 gap-3">
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              {transcript.callActive ? (
                <span className="flex items-center gap-1.5 text-green-500">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-medium">Call Active</span>
                  <span className="text-xs text-gray-400 ml-1">{transcript.elapsedTime}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                  <span className="text-xs">No Active Call</span>
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className={`${transcript.isRecording ? 'bg-red-50 text-red-700' : ''}`}
              onClick={transcript.toggleRecording}
            >
              {transcript.isRecording ? (
                <>
                  <MicOff className="h-3.5 w-3.5 mr-1" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-3.5 w-3.5 mr-1" /> Start Recording
                </>
              )}
            </Button>
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <div className="flex justify-center pt-2">
          <span className="text-center text-xs text-gray-400">
            {transcript.awaitingUserResponse 
              ? "Customer is waiting for your response" 
              : "Waiting for customer input"}
          </span>
        </div>
      </div>

      {/* Module container that will display active modules */}
      {transcript.activeModule && (
        <ModuleContainer
          moduleConfig={transcript.activeModule}
          onClose={transcript.closeModule}
          onComplete={handleModuleComplete}
          currentState={transcript.currentState}
          stateData={transcript.stateData}
        />
      )}
    </div>
  );
};

export default TranscriptPanel;
