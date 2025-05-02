
import React, { useState } from 'react';
import { Mic, CornerDownLeft, PhoneCall, PhoneOff, Clock, AlertCircle, ExternalLink, FileJson, MessageSquare, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScenarioType } from './ScenarioSelector';
import { useTranscript } from '@/hooks/useTranscript';
import Message from './transcript/Message';
import IncomingCallCard from './transcript/IncomingCall';
import PreCallInfo from './transcript/PreCallInfo';
import { incomingCalls as scenarioIncomingCalls, preCalls as scenarioPreCalls } from '@/data/scenarioData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getStateMachineJson, hasStateMachine } from '@/utils/stateMachineLoader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define the PreCall type to match what PreCallInfo component expects
export type PreCall = {
  id: string; // Updated to string to match PreCallInfo
  timestamp: string;
  agent: string;
  content: string;
  response: string;
  customerName: string;
  callType: string;
};

// Convert PreCallInfo[] to Precall[]
const convertPreCallsToPrecallFormat = (): PreCall[] => {
  return scenarioPreCalls.map((preCall) => ({
    id: preCall.id,
    timestamp: '14:32:15', // Default time
    agent: 'RoboVoice',
    content: preCall.content,
    response: preCall.title, // Using title as response
    customerName: scenarioIncomingCalls[0]?.name || 'Customer',
    callType: 'Support Call'
  }));
};

// Convert IncomingCall to IncomingCallWithCustomFields
type IncomingCallWithCustomFields = {
  id: string; // Updated to string to match IncomingCall
  customerName: string;
  phoneNumber: string;
  waitTime: string;
  callType: string;
  priority: 'low' | 'medium' | 'high';
  expertise: string;
  matchScore: number;
  caseHistory: any[];
  roboCallSummary: {
    duration: string;
    intents: string[];
    sentiment: string;
    keyPoints: string[];
  };
};

// Convert IncomingCall[] to IncomingCallWithCustomFields[]
const convertIncomingCallsToCustomFormat = (): IncomingCallWithCustomFields[] => {
  return scenarioIncomingCalls.map((call) => ({
    id: call.id,
    customerName: call.name,
    phoneNumber: call.phoneNumber,
    waitTime: `${call.waitTime}s`,
    callType: call.reason,
    priority: call.urgency,
    expertise: call.company || 'General Inquiry',
    matchScore: 80,
    caseHistory: [],
    roboCallSummary: {
      duration: '0m 0s',
      intents: [],
      sentiment: 'Neutral',
      keyPoints: []
    }
  }));
};

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ activeScenario }) => {
  const [historyCollapsed, setHistoryCollapsed] = useState(true);
  const [showStateMachineInfo, setShowStateMachineInfo] = useState(false);
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState<string>("");
  const [isLoadingJson, setIsLoadingJson] = useState(false);
  
  // Convert the scenario data to the expected format
  const preCalls = convertPreCallsToPrecallFormat();
  const incomingCalls = convertIncomingCallsToCustomFormat();
  
  const {
    messages,
    inputValue,
    setInputValue,
    isRecording,
    callActive,
    elapsedTime,
    acceptedCallId,
    messagesEndRef,
    handleSendMessage,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    handleSelectResponse,
    toggleRecording,
    handleCall,
    handleAcceptCall,
    currentState,
    stateData,
    lastStateChange
  } = useTranscript(activeScenario);

  // Check if this scenario has a state machine
  const hasStateMachineAvailable = activeScenario && hasStateMachine(activeScenario);
  
  // Function to open the JSON dialog
  const handleViewJson = async () => {
    if (!activeScenario) return;
    
    setIsLoadingJson(true);
    try {
      const json = await getStateMachineJson(activeScenario);
      setJsonContent(json);
      setIsJsonDialogOpen(true);
    } catch (error) {
      console.error("Failed to load JSON:", error);
      setJsonContent("Error loading state machine JSON");
    } finally {
      setIsLoadingJson(false);
    }
  };

  return (
    <Card className="flex flex-col h-full border-none shadow-none">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div>
            <CardTitle className="text-lg">Transcript</CardTitle>
            <CardDescription className="flex items-center gap-2 flex-wrap">
              {activeScenario && (
                <Badge variant="outline" className="capitalize">
                  {activeScenario}
                </Badge>
              )}
              {hasStateMachineAvailable && currentState && (
                <Badge 
                  variant="secondary" 
                  className="cursor-help flex items-center gap-1"
                  onClick={() => setShowStateMachineInfo(!showStateMachineInfo)}
                >
                  <span>State: {currentState}</span>
                  <ExternalLink size={10} />
                </Badge>
              )}
              
              {/* State change notification with update icon */}
              {lastStateChange && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className="animate-pulse bg-primary/10 text-primary flex items-center gap-1 cursor-help"
                      >
                        <RefreshCw size={12} className="animate-spin-slow" />
                        <span>Updated</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">State changed from {lastStateChange.from} to {lastStateChange.to}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              Call transcript and suggestions
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeScenario && (
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              title="View State Machine JSON"
              onClick={handleViewJson}
              disabled={isLoadingJson}
            >
              <FileJson size={16} />
            </Button>
          )}
          {callActive ? (
            <>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock size={14} className="text-red-500" />
                <span>{elapsedTime}</span>
              </Badge>
              <Button 
                size="icon" 
                variant="destructive" 
                onClick={handleCall}
                title="End Call"
                className="h-8 w-8"
              >
                <PhoneOff size={16} />
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              variant="default" 
              onClick={handleCall}
              className="h-8"
            >
              <PhoneCall size={16} className="mr-1" />
              Start Call
            </Button>
          )}
        </div>
      </CardHeader>
      
      {showStateMachineInfo && hasStateMachineAvailable && (
        <div className="mx-4 mb-2 p-2 bg-muted/50 rounded-md border border-border text-xs">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">State Machine Information</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => setShowStateMachineInfo(false)}
            >
              <PhoneOff size={14} />
            </Button>
          </div>
          <p className="text-muted-foreground mt-1">
            Current state: <span className="font-medium">{currentState}</span>
          </p>
          <p className="text-muted-foreground mt-1">
            Type: <span className="font-medium">
              {stateData?.stateType || "unknown"}
            </span>
          </p>
          {stateData?.nextState && (
            <p className="text-muted-foreground mt-1">
              Next state: <span className="font-medium">
                {stateData.nextState}
              </span>
            </p>
          )}
          {stateData?.action && (
            <p className="text-muted-foreground mt-1">
              Action: <span className="font-medium">
                {stateData.action}
              </span>
            </p>
          )}
        </div>
      )}
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {!callActive && !acceptedCallId && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">Incoming Calls</h3>
              {incomingCalls.map((call) => (
                <IncomingCallCard 
                  key={call.id} 
                  call={call} 
                  onAcceptCall={handleAcceptCall} 
                />
              ))}
              
              {/* Pre-call information section */}
              <PreCallInfo preCalls={preCalls} />
            </div>
          )}
          
          {/* State machine not available warning */}
          {callActive && activeScenario && !hasStateMachineAvailable && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 mb-3">
              <AlertCircle size={16} />
              <span>No state machine available for the current scenario. Using fallback conversation flow.</span>
            </div>
          )}
          
          {/* Message transcript */}
          {messages.map((message) => (
            <Message 
              key={message.id} 
              message={message}
              onAcceptSuggestion={(suggestionId, messageId) => handleAcceptSuggestion(messageId, suggestionId)}
              onRejectSuggestion={(suggestionId, messageId) => handleRejectSuggestion(messageId)}
              onSelectResponse={handleSelectResponse}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {callActive && stateData && stateData.responseOptions && stateData.responseOptions.length > 0 ? (
          <div className="p-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} className="text-primary" />
              <span className="text-sm font-medium">Available Responses:</span>
            </div>
            <div className="grid gap-2">
              {stateData.responseOptions.map((option, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="justify-start text-left h-auto py-2"
                  onClick={() => handleSelectResponse(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ) : callActive && (
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button 
                size="icon" 
                variant="outline" 
                className={`${isRecording ? 'bg-red-100 text-red-500' : ''} h-9`}
                onClick={toggleRecording}
                aria-label="Toggle microphone"
              >
                <Mic size={16} />
              </Button>
              <Input 
                placeholder="Type your response here..." 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                type="submit" 
                size="icon" 
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="h-9"
                aria-label="Send message"
              >
                <CornerDownLeft size={16} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Dialog to display the full JSON state machine */}
      <Dialog open={isJsonDialogOpen} onOpenChange={setIsJsonDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>State Machine for {activeScenario}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
              {jsonContent}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TranscriptPanel;
