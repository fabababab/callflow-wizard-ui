
import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { usePhysioCoverageStateMachine } from '@/hooks/usePhysioCoverageStateMachine';
import { useCustomerScenario } from '@/hooks/useCustomerScenario';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { nanoid } from 'nanoid';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PhoneCall, PhoneOff, Clock, FileJson, Shield, RefreshCcw, Check, AlertCircle, MessageSquare, Network } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { detectSensitiveData, ValidationStatus } from '@/data/scenarioData';
import { useToast } from '@/hooks/use-toast';
import StateMachineSelector from '@/components/StateMachineSelector';
import DecisionTreeVisualizer from '@/components/DecisionTreeVisualizer';
import { loadStateMachine, StateMachine } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranscript } from '@/hooks/useTranscript';
import ChatMessages from '@/components/TestScenario/ChatMessages';
import StateDataDisplay from '@/components/TestScenario/StateDataDisplay';
import CallControl from '@/components/TestScenario/CallControl';
import MessageInput from '@/components/TestScenario/MessageInput';
import EmptyChat from '@/components/TestScenario/EmptyChat';

type Message = {
  id: string;
  text: string;
  sender: 'agent' | 'customer' | 'system';
  timestamp: Date;
  responseOptions?: string[];
  sensitiveData?: Array<{
    id: string;
    type: string;
    value: string;
    status: ValidationStatus;
    notes?: string;
    requiresVerification?: boolean;
  }>;
  requiresVerification?: boolean;
  isVerified?: boolean;
};

const TestScenario = () => {
  const { toast } = useToast();
  const [callActive, setCallActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isAgentMode, setIsAgentMode] = useState(true); // Default to agent mode (you responding as agent)
  const [previousState, setPreviousState] = useState<string>('');
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [sensitiveDataStats, setSensitiveDataStats] = useState<{
    validated: number;
    pending: number;
    invalid: number;
  }>({ validated: 0, pending: 0, invalid: 0 });
  const [verificationBlocking, setVerificationBlocking] = useState(false);
  const [selectedStateMachine, setSelectedStateMachine] = useState<ScenarioType>("bankDetails");
  const [loadedStateMachine, setLoadedStateMachine] = useState<StateMachine | null>(null);
  const [jsonContent, setJsonContent] = useState<string>("");
  const [stateChanged, setStateChanged] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Use the useTranscript hook for the active scenario
  const transcript = useTranscript(selectedStateMachine);
  
  // Choose the appropriate state machine based on the mode
  const customerScenario = useCustomerScenario();
  const physioCoverage = usePhysioCoverageStateMachine();
  
  // Use the appropriate scenario based on the mode
  const activeScenario = isAgentMode ? customerScenario : physioCoverage;
  const {
    currentState,
    isLoading,
    error,
    getSystemMessage,
    startConversation,
    resetConversation,
    isFinalState,
  } = activeScenario;
  
  // Use type narrowing to safely access mode-specific properties
  const processAgentResponse = isAgentMode 
    ? customerScenario.processAgentResponse 
    : physioCoverage.processEvent;
    
  const getCustomerText = isAgentMode 
    ? customerScenario.getCustomerText 
    : (() => '');
    
  const getAgentOptions = isAgentMode 
    ? customerScenario.getAgentOptions 
    : (() => []);

  // Load state machine when selected scenario changes
  useEffect(() => {
    async function fetchStateMachine() {
      if (selectedStateMachine) {
        try {
          const machine = await loadStateMachine(selectedStateMachine);
          setLoadedStateMachine(machine);
          
          // Also load the JSON content for display
          if (machine) {
            setJsonContent(JSON.stringify(machine, null, 2));
          }
          
          // Reset any active call when changing scenarios
          if (callActive) {
            handleEndCall();
          }
          
          // Force switch to chat view when selecting a new state machine
          setActiveTab("chat");
          
        } catch (error) {
          console.error("Failed to load state machine:", error);
          toast({
            title: "Error",
            description: `Failed to load ${selectedStateMachine} state machine`,
            variant: "destructive"
          });
        }
      }
    }
    
    fetchStateMachine();
  }, [selectedStateMachine, toast]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript.messages]);

  // Update timer when call is active
  useEffect(() => {
    if (callActive) {
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setElapsedTime(
          `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callActive]);

  // Reset state changed indicator after some time
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (stateChanged) {
      timeout = setTimeout(() => {
        setStateChanged(false);
      }, 3000);
    }
    
    return () => clearTimeout(timeout);
  }, [stateChanged]);

  // Monitor state changes
  useEffect(() => {
    if (previousState && currentState !== previousState) {
      setStateChanged(true);
      
      toast({
        title: "State Changed",
        description: `Transitioned from "${previousState}" to "${currentState}"`,
      });
    }
  }, [currentState, previousState, toast]);

  // Update messages based on state changes - using useTranscript hook
  useEffect(() => {
    // Use the transcript's messages directly when they update
    if (transcript.messages.length > 0) {
      setMessages(transcript.messages);
    }
  }, [transcript.messages, transcript.lastTranscriptUpdate]);

  // Handle starting a call
  const handleStartCall = () => {
    console.log('Starting test call for scenario:', selectedStateMachine);
    setMessages([]);
    setCallActive(true);
    setPreviousState('');
    setActiveTab("chat");
    setSensitiveDataStats({ validated: 0, pending: 0, invalid: 0 });
    setVerificationBlocking(false);
    
    // Use the transcript hook to handle the call
    transcript.handleCall();
    
    toast({
      title: "Call Started",
      description: `Test call started for ${selectedStateMachine} scenario`,
    });
  };

  // Handle ending a call
  const handleEndCall = () => {
    setCallActive(false);
    
    // Use the transcript hook to handle call ending
    if (transcript.callActive) {
      transcript.handleHangUpCall();
    }
    
    toast({
      title: "Call Ended",
      description: "Test call has been ended",
    });
  };

  // Handle selecting a response option
  const handleSelectResponse = (response: string) => {
    transcript.handleSelectResponse(response);
  };

  // Handle sending a custom message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Use transcript to handle message sending
    transcript.setInputValue(inputValue);
    transcript.handleSendMessage();
    
    setInputValue('');
  };

  // Handle toggling the agent mode
  const handleToggleAgentMode = () => {
    if (callActive) {
      transcript.addSystemMessage("Can't change roles during an active call");
      return;
    }
    setIsAgentMode(!isAgentMode);
  };

  // Handle resetting the scenario
  const handleResetScenario = () => {
    if (!callActive) {
      // Start a new call if none is active
      handleStartCall();
      return;
    }
    
    console.log('Resetting scenario');
    // Reset the state machine via transcript
    transcript.addSystemMessage('Scenario reset');
    
    // Reset the timer
    startTimeRef.current = Date.now();
    setElapsedTime('00:00');
    
    toast({
      title: "Scenario Reset",
      description: "The conversation has been reset to its initial state",
    });
  };

  // Handle state selection from visualizer
  const handleStateSelect = (state: string) => {
    if (!callActive) {
      // If no call is active, start a call and then jump to the state
      handleStartCall();
      
      // Delay the state transition to ensure the call has started
      setTimeout(() => {
        setPreviousState('');
        transcript.handleCall();
        
        if (loadedStateMachine && loadedStateMachine.states[state]) {
          // Force transition to the selected state
          if (isAgentMode) {
            customerScenario.setCurrentState(state);
          } else {
            physioCoverage.setCurrentState(state);
          }
          
          // Add a system message about the state change
          transcript.addSystemMessage(`State manually set to: ${state}`);
        }
      }, 500);
      
      return;
    }
    
    // Check if the selected state is valid in the current state machine
    if (loadedStateMachine && loadedStateMachine.states[state]) {
      // Force transition to the selected state
      if (isAgentMode) {
        customerScenario.setCurrentState(state);
      } else {
        physioCoverage.setCurrentState(state);
      }
      
      // Update the previous state to avoid duplicate messages
      setPreviousState(state);
      
      toast({
        title: "State Changed",
        description: `Jumped to state: ${state}`,
      });
      
      // Add a system message about the state change
      transcript.addSystemMessage(`State manually changed to: ${state}`);
    } else {
      toast({
        title: "Invalid State",
        description: "Cannot navigate to that state in the current scenario",
        variant: "destructive"
      });
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle validating sensitive data
  const handleValidateSensitiveData = (messageId: string, fieldId: string, status: ValidationStatus, notes?: string) => {
    transcript.handleValidateSensitiveData(messageId, fieldId, status, notes);
  };

  // Handle verifying system check
  const handleVerifySystemCheck = (messageId: string) => {
    transcript.handleVerifySystemCheck(messageId);
  };

  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider>
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="grid gap-6">
              <Card className="flex-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {isAgentMode ? "Agent Mode: You help the customer" : "Customer Mode: AI helps you"}
                      {stateChanged && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle size={16} className="text-amber-500 animate-pulse" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>State updated: {currentState}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="agent-mode" checked={isAgentMode} onCheckedChange={handleToggleAgentMode} disabled={callActive} />
                        <Label htmlFor="agent-mode">You are the agent</Label>
                      </div>
                      {!isAgentMode && "Using physio coverage conversation flow"}
                      {isAgentMode && "Using customer scenario flow"}
                    </CardDescription>
                  </div>
                  
                  <StateMachineSelector 
                    activeStateMachine={selectedStateMachine} 
                    onSelectStateMachine={setSelectedStateMachine}
                    disabled={callActive}
                  />
                </CardHeader>
                <CardContent>
                  <CallControl 
                    callActive={callActive}
                    elapsedTime={elapsedTime}
                    onStartCall={handleStartCall}
                    onEndCall={handleEndCall}
                    onResetScenario={handleResetScenario}
                  />
                </CardContent>
              </Card>

              {isLoading && (
                <Card>
                  <CardContent className="py-4">
                    <p className="text-center">Loading state machine...</p>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Card>
                  <CardContent className="py-4">
                    <p className="text-red-500">{error}</p>
                  </CardContent>
                </Card>
              )}

              {/* Main content section - now shows up whether call is active or not */}
              {loadedStateMachine && (
                <Card className="flex-1 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Test Conversation</CardTitle>
                      <CardDescription>
                        {callActive ? (
                          <>
                            Current state: {transcript.currentState}
                            {verificationBlocking && (
                              <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-700">
                                Waiting for verification
                              </Badge>
                            )}
                          </>
                        ) : (
                          "Select a state machine and start a test call"
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {sensitiveDataStats.pending + sensitiveDataStats.validated + sensitiveDataStats.invalid > 0 && (
                        <div className="bg-secondary/10 p-1.5 rounded-md flex items-center gap-2 text-xs">
                          <Shield size={16} className="text-primary" />
                          <span className="font-medium">Sensitive Data:</span>
                          {sensitiveDataStats.validated > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                              {sensitiveDataStats.validated} validated
                            </Badge>
                          )}
                          {sensitiveDataStats.pending > 0 && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                              {sensitiveDataStats.pending} pending
                            </Badge>
                          )}
                          {sensitiveDataStats.invalid > 0 && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200">
                              {sensitiveDataStats.invalid} invalid
                            </Badge>
                          )}
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => setShowJsonDialog(true)}
                      >
                        <FileJson size={16} />
                        View JSON
                      </Button>
                      {!callActive && (
                        <Button 
                          onClick={handleStartCall} 
                          variant="default"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <PhoneCall size={16} />
                          Start Call
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Tabs defaultValue="chat" value={activeTab} onValueChange={handleTabChange} className="w-full">
                      <TabsList className="grid grid-cols-3 mx-4 mt-4">
                        <TabsTrigger value="chat" className="flex items-center gap-1">
                          <MessageSquare size={16} />
                          Chat View
                        </TabsTrigger>
                        <TabsTrigger value="state" className="flex items-center gap-1">
                          <FileJson size={16} />
                          State Data
                        </TabsTrigger>
                        <TabsTrigger value="visualization" className="flex items-center gap-1">
                          <Network size={16} />
                          Decision Tree
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="chat" className="p-4 max-h-[60vh] overflow-y-auto">
                        {transcript.messages.length > 0 ? (
                          <ChatMessages 
                            messages={transcript.messages}
                            isAgentMode={isAgentMode}
                            onSelectResponse={handleSelectResponse}
                            onVerifySystemCheck={handleVerifySystemCheck}
                            onValidateSensitiveData={handleValidateSensitiveData}
                            messagesEndRef={messagesEndRef}
                          />
                        ) : !callActive ? (
                          <EmptyChat onStartCall={handleStartCall} />
                        ) : (
                          <div className="text-center p-6 text-muted-foreground">
                            <p>Waiting for messages...</p>
                          </div>
                        )}

                        {callActive && (
                          <MessageInput 
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            handleSendMessage={handleSendMessage}
                            isBlocked={verificationBlocking}
                            isAgentMode={isAgentMode}
                          />
                        )}
                      </TabsContent>
                      <TabsContent value="state" className="p-4 max-h-[60vh] overflow-y-auto">
                        <StateDataDisplay 
                          currentState={transcript.currentState || currentState}
                          stateData={transcript.stateData}
                        />
                      </TabsContent>
                      <TabsContent value="visualization" className="p-4">
                        <DecisionTreeVisualizer 
                          stateMachine={loadedStateMachine}
                          currentState={transcript.currentState || currentState}
                          onStateClick={handleStateSelect}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Display the state machine visualizer when not in a call */}
              {!loadedStateMachine && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p>Please select a state machine to start testing</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SidebarProvider>

      {/* Dialog to display the JSON file */}
      <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedStateMachine} State Machine
            </DialogTitle>
            <CardDescription>
              Complete JSON representation of the state machine flow
            </CardDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-x-auto">
              {jsonContent}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestScenario;
