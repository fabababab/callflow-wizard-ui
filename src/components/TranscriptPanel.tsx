import React, { useState, useEffect } from 'react';
import { Mic, CornerDownLeft, PhoneCall, PhoneOff, Clock, AlertCircle, ExternalLink, FileJson, MessageSquare, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScenarioType } from './ScenarioSelector';
import { useTranscript } from '@/hooks/useTranscript';
import MessageComponent, { Message as MessageType } from './transcript/Message';
import SystemMessageGroup from './transcript/SystemMessageGroup';
import IncomingCallCard from './transcript/IncomingCall';
import PreCallInfo from './transcript/PreCallInfo';
import { incomingCalls as scenarioIncomingCalls, preCalls as scenarioPreCalls, SensitiveField, ValidationStatus, SensitiveDataType } from '@/data/scenarioData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getStateMachineJson, hasStateMachine, getAvailableStateMachines } from '@/utils/stateMachineLoader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CallControl from './TestScenario/CallControl';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  return scenarioPreCalls.map(preCall => ({
    id: preCall.id,
    timestamp: '14:32:15',
    // Default time
    agent: 'RoboVoice',
    content: preCall.content,
    response: preCall.title,
    // Using title as response
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
  return scenarioIncomingCalls.map(call => ({
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

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  activeScenario
}) => {
  const [historyCollapsed, setHistoryCollapsed] = useState(true);
  const [showStateMachineInfo, setShowStateMachineInfo] = useState(false);
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState<string>("");
  const [isLoadingJson, setIsLoadingJson] = useState(false);
  const [availableScenarios, setAvailableScenarios] = useState<ScenarioType[]>([]);
  console.log("TranscriptPanel rendering with scenario:", activeScenario);

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
    lastStateChange,
    handleHangUpCall,
    resetConversation
  } = useTranscript(activeScenario);

  // Check if this scenario has a state machine
  const hasStateMachineAvailable = activeScenario && hasStateMachine(activeScenario);

  // Load available state machines
  useEffect(() => {
    const loadScenarios = async () => {
      const machines = await getAvailableStateMachines();
      setAvailableScenarios(machines);
    };
    loadScenarios();
  }, []);

  // Group consecutive system messages
  const groupedMessages = React.useMemo(() => {
    const result: (MessageType | MessageType[])[] = [];
    let systemMessageGroup: MessageType[] = [];
    
    messages.forEach(message => {
      if (message.sender === 'system') {
        // Add to current system message group
        // Need to convert the useMessageHandling Message type to MessageType from Message component
        const convertedMessage: MessageType = {
          ...message,
          sensitiveData: message.sensitiveData ? message.sensitiveData.map(field => ({
            ...field,
            type: field.type as SensitiveDataType // Type assertion to match the expected SensitiveDataType
          })) : undefined
        };
        systemMessageGroup.push(convertedMessage);
      } else {
        // If we have system messages stored, push them first
        if (systemMessageGroup.length > 0) {
          result.push([...systemMessageGroup]);
          systemMessageGroup = [];
        }
        // Then push the current non-system message
        // Also convert non-system message types
        const convertedMessage: MessageType = {
          ...message,
          sensitiveData: message.sensitiveData ? message.sensitiveData.map(field => ({
            ...field,
            type: field.type as SensitiveDataType // Type assertion to match the expected SensitiveDataType
          })) : undefined
        };
        result.push(convertedMessage);
      }
    });
    
    // Don't forget any remaining system messages
    if (systemMessageGroup.length > 0) {
      result.push([...systemMessageGroup]);
    }
    
    return result;
  }, [messages]);

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

  // Handle changing the scenario from the selector
  const handleScenarioChange = (value: string) => {
    if (callActive) {
      handleHangUpCall();
    }
    const scenarioValue = value as ScenarioType;
    
    // Use our parent component's way to update the scenario
    const event = new CustomEvent('scenario-change', { 
      detail: { scenario: scenarioValue }
    });
    window.dispatchEvent(event);
  };

  // Debug state changes
  useEffect(() => {
    console.log("Current state:", currentState);
    console.log("Current stateData:", stateData);
    console.log("Last state change:", lastStateChange);
  }, [currentState, stateData, lastStateChange]);

  // Debug messages
  useEffect(() => {
    console.log("Current messages:", messages);
  }, [messages]);
  return <Card className="flex flex-col h-full border-none shadow-none">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div>
            <CardTitle className="text-lg">Transcript</CardTitle>
            <CardDescription className="flex items-center gap-2 flex-wrap">
              {activeScenario && <Badge variant="outline" className="capitalize">
                  {activeScenario}
                </Badge>}
              {hasStateMachineAvailable && currentState && <Badge variant="secondary" className="cursor-help flex items-center gap-1" onClick={() => setShowStateMachineInfo(!showStateMachineInfo)}>
                  <span>State: {currentState}</span>
                  <ExternalLink size={10} />
                </Badge>}
              
              {/* State change notification with update icon */}
              {lastStateChange && <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="animate-pulse bg-primary/10 text-primary flex items-center gap-1 cursor-help">
                        <RefreshCw size={12} className="animate-spin-slow" />
                        <span>Updated</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">State changed from {lastStateChange.from} to {lastStateChange.to}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>}
              
              Agent call transcript
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Timer display for active calls */}
          {callActive && <Badge variant="outline" className="flex items-center gap-1">
              <Clock size={14} className="text-red-500" />
              <span>{elapsedTime}</span>
            </Badge>}
          
          {/* JSON viewer button */}
          <Button size="icon" variant="outline" className="h-8 w-8" title="View State Machine JSON" onClick={handleViewJson} disabled={isLoadingJson}>
            <FileJson size={16} />
          </Button>
          
          {/* Call control buttons */}
          <CallControl callActive={callActive} elapsedTime={elapsedTime} onStartCall={handleCall} onEndCall={handleHangUpCall} onResetScenario={resetConversation} />
          
          {/* Menu with additional options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MessageSquare size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={() => setShowStateMachineInfo(!showStateMachineInfo)}>
                {showStateMachineInfo ? "Hide" : "Show"} State Info
              </DropdownMenuItem>
              <DropdownMenuItem onClick={resetConversation}>
                Reset Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Add scenario selector below the header */}
      <div className="px-4 mb-2 flex">
        <Select onValueChange={handleScenarioChange} value={activeScenario}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select scenario" />
          </SelectTrigger>
          <SelectContent align="center" className="bg-white">
            <SelectGroup>
              {availableScenarios.map((scenario) => (
                <SelectItem 
                  key={scenario} 
                  value={scenario}
                  className="capitalize"
                  disabled={callActive}
                >
                  {scenario}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {showStateMachineInfo && hasStateMachineAvailable && <div className="mx-4 mb-2 p-2 bg-muted/50 rounded-md border border-border text-xs">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">State Machine Information</h4>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowStateMachineInfo(false)}>
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
          {stateData?.nextState && <p className="text-muted-foreground mt-1">
              Next state: <span className="font-medium">
                {stateData.nextState}
              </span>
            </p>}
          {stateData?.action && <p className="text-muted-foreground mt-1">
              Action: <span className="font-medium">
                {stateData.action}
              </span>
            </p>}
        </div>}
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {!callActive && !acceptedCallId}
          
          {/* State machine not available warning */}
          {callActive && activeScenario && !hasStateMachineAvailable && <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 mb-3">
              <AlertCircle size={16} />
              <span>No state machine available for the current scenario. Using fallback conversation flow.</span>
            </div>}
          
          {/* Agent guidance - new section */}
          {callActive && <div className="text-xs p-2 mb-2 bg-blue-50 border border-blue-100 rounded">
              <p className="font-medium text-blue-800">Agent Instructions:</p>
              <p className="text-blue-700">You're the call center agent. Review customer messages and select appropriate responses.</p>
            </div>}
          
          {/* Message transcript with grouped system messages */}
          {groupedMessages.map((item, index) => {
            if (Array.isArray(item)) {
              // This is a group of system messages
              return item.length === 1 ? (
                // If only one system message, render it normally
                <MessageComponent 
                  key={item[0].id} 
                  message={item[0]} // Already converted in groupedMessages
                  onAcceptSuggestion={handleAcceptSuggestion} 
                  onRejectSuggestion={handleRejectSuggestion} 
                  onSelectResponse={handleSelectResponse}
                />
              ) : (
                // Otherwise, render as a group
                <SystemMessageGroup key={`group-${index}`} messages={item} />
              );
            } else {
              // Regular message - already converted in groupedMessages
              return (
                <MessageComponent 
                  key={item.id} 
                  message={item}
                  onAcceptSuggestion={(suggestionId, messageId) => handleAcceptSuggestion(messageId, suggestionId)} 
                  onRejectSuggestion={handleRejectSuggestion} 
                  onSelectResponse={handleSelectResponse}
                />
              );
            }
          })}
          <div ref={messagesEndRef} />
        </div>
        
        {callActive && stateData && stateData.meta?.suggestions && stateData.meta.suggestions.length > 0 ? <div className="p-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} className="text-primary" />
              <span className="text-sm font-medium">Available Agent Responses:</span>
            </div>
            <div className="grid gap-2">
              {stateData.meta.suggestions.map((option, index) => <Button key={index} variant="outline" className="justify-start text-left h-auto py-2" onClick={() => handleSelectResponse(option)}>
                  {option}
                </Button>)}
            </div>
          </div> : callActive && <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button size="icon" variant="outline" className={`${isRecording ? 'bg-red-100 text-red-500' : ''} h-9`} onClick={toggleRecording} aria-label="Toggle microphone">
                <Mic size={16} />
              </Button>
              <Input placeholder="Type your agent response here..." value={inputValue} onChange={e => setInputValue(e.target.value)} className="flex-1" onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
              <Button type="submit" size="icon" onClick={handleSendMessage} disabled={!inputValue.trim()} className="h-9" aria-label="Send message">
                <CornerDownLeft size={16} />
              </Button>
            </div>
          </div>}
      </CardContent>
      
      {/* Dialog to display the full JSON state machine */}
      <Dialog open={isJsonDialogOpen} onOpenChange={setIsJsonDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>State Machine for {activeScenario}</DialogTitle>
            <DialogDescription>
              Full state machine configuration
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
              {jsonContent}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </Card>;
};
export default TranscriptPanel;
