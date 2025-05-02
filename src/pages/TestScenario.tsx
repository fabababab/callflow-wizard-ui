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
import { PhoneCall, PhoneOff, Clock, FileJson, Shield, RefreshCcw, Check, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { detectSensitiveData, ValidationStatus } from '@/data/scenarioData';
import { useToast } from '@/hooks/use-toast';
import StateMachineSelector from '@/components/StateMachineSelector';
import DecisionTreeVisualizer from '@/components/DecisionTreeVisualizer';
import { loadStateMachine, StateMachine } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
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
  }, [messages]);

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

  // Add a system message
  const addSystemMessage = (text: string, requiresVerification: boolean = false) => {
    setMessages(prev => [
      ...prev,
      {
        id: nanoid(),
        text,
        sender: 'system',
        timestamp: new Date(),
        requiresVerification,
        isVerified: !requiresVerification
      }
    ]);
    
    if (requiresVerification) {
      setVerificationBlocking(true);
    }
  };

  // Add an agent message
  const addAgentMessage = (text: string, responseOptions: string[] = []) => {
    setMessages(prev => [
      ...prev,
      {
        id: nanoid(),
        text,
        sender: 'agent',
        timestamp: new Date(),
        responseOptions
      }
    ]);
  };

  // Add a customer message with sensitive data detection
  const addCustomerMessage = (text: string, responseOptions: string[] = []) => {
    // Detect sensitive data in the message
    const sensitiveData = detectSensitiveData(text);
    
    // Check if any sensitive data requires verification
    const hasVerificationRequired = sensitiveData.some(data => data.requiresVerification);
    
    // If sensitive data is found, show a toast notification
    if (sensitiveData.length > 0) {
      toast({
        title: "Sensitive Data Detected",
        description: hasVerificationRequired 
          ? `${sensitiveData.length} sensitive data fields found that require verification` 
          : `${sensitiveData.length} sensitive data fields found in message`,
        variant: hasVerificationRequired ? "destructive" : "default"
      });
      
      // Update sensitive data stats
      setSensitiveDataStats(prev => ({
        ...prev,
        pending: prev.pending + sensitiveData.length
      }));
      
      // Block progress if verification is required
      if (hasVerificationRequired) {
        setVerificationBlocking(true);
      }
    }
    
    setMessages(prev => [
      ...prev,
      {
        id: nanoid(),
        text,
        sender: 'customer',
        timestamp: new Date(),
        responseOptions,
        sensitiveData: sensitiveData.length > 0 ? sensitiveData : undefined,
      }
    ]);
  };

  // Handle validating sensitive data
  const handleValidateSensitiveData = (messageId: string, fieldId: string, status: ValidationStatus, notes?: string) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId && message.sensitiveData) {
        const updatedFields = message.sensitiveData.map(field => {
          if (field.id === fieldId) {
            const previousStatus = field.status;
            
            // Update stats based on status change
            if (previousStatus !== status) {
              setSensitiveDataStats(stats => {
                const newStats = { ...stats };
                if (previousStatus === 'pending') newStats.pending--;
                else if (previousStatus === 'valid') newStats.validated--;
                else if (previousStatus === 'invalid') newStats.invalid--;
                
                if (status === 'pending') newStats.pending++;
                else if (status === 'valid') newStats.validated++;
                else if (status === 'invalid') newStats.invalid++;
                
                return newStats;
              });
            }
            
            // If this is a required verification field being marked as valid or invalid
            // check if we can unblock the conversation
            if (field.requiresVerification && (status === 'valid' || status === 'invalid')) {
              checkIfVerificationComplete();
            }
            
            return { ...field, status, notes };
          }
          return field;
        });
        
        return { ...message, sensitiveData: updatedFields };
      }
      return message;
    }));
    
    // Show validation toast
    toast({
      title: status === 'valid' ? "Validated" : "Validation Failed",
      description: `Customer data marked as ${status}`,
      variant: status === 'valid' ? "default" : "destructive"
    });
  };
  
  // Check if all required verifications are completed
  const checkIfVerificationComplete = () => {
    // Check all messages with sensitive data that require verification
    const allVerified = messages.every(message => {
      if (!message.sensitiveData) return true;
      
      // Check if any sensitive data field requires verification but is still pending
      return !message.sensitiveData.some(field => 
        field.requiresVerification && field.status === 'pending'
      );
    });
    
    if (allVerified) {
      setVerificationBlocking(false);
      toast({
        title: "All Required Verifications Completed",
        description: "The conversation can now continue",
        variant: "default"
      });
    }
  };

  // Handle verifying system check
  const handleVerifySystemCheck = (messageId: string) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId && message.requiresVerification) {
        return { ...message, isVerified: true };
      }
      return message;
    }));
    
    // Unblock the scenario progress
    setVerificationBlocking(false);
    
    toast({
      title: "Verification Complete",
      description: "The system check has been verified and the scenario can continue",
      variant: "default"
    });
  };

  // Update messages based on state changes
  useEffect(() => {
    if (!callActive || isLoading || currentState === previousState || verificationBlocking) return;

    // Update the previous state to avoid duplicate messages
    setPreviousState(currentState);
    
    // Handle system message if present
    const systemMessage = getSystemMessage();
    if (systemMessage) {
      // Randomly determine if this system message requires verification (20% chance)
      const requiresVerification = Math.random() < 0.2;
      addSystemMessage(systemMessage, requiresVerification);
      
      // If verification is required, don't proceed with rest of the updates
      if (requiresVerification) return;
    }

    if (isAgentMode) {
      // In agent mode, we show customer messages and agent response options
      const customerText = getCustomerText();
      
      if (customerText) {
        addCustomerMessage(customerText);
        
        // After adding customer message, get agent options and add empty agent message with options
        const agentOptions = getAgentOptions();
        if (agentOptions && agentOptions.length > 0) {
          addAgentMessage("", agentOptions);
        }
      }
    } else {
      // In customer mode (original behavior)
      const agentText = physioCoverage.getAgentText();
      if (agentText) {
        const suggestions = physioCoverage.getSuggestions();
        addAgentMessage(agentText, suggestions);
      }
    }

    // Auto-end call when reaching final state
    if (isFinalState()) {
      setTimeout(() => setCallActive(false), 3000);
    }
  }, [callActive, currentState, isLoading, getSystemMessage, isAgentMode, getCustomerText, getAgentOptions, physioCoverage, previousState, isFinalState, verificationBlocking]);

  // Handle starting a call
  const handleStartCall = () => {
    setMessages([]);
    setCallActive(true);
    setPreviousState('');
    resetConversation();
    setSensitiveDataStats({ validated: 0, pending: 0, invalid: 0 });
    setVerificationBlocking(false);
    addSystemMessage('Call started');
    startConversation();
  };

  // Handle ending a call
  const handleEndCall = () => {
    setCallActive(false);
    addSystemMessage('Call ended');
  };

  // Handle selecting a response option
  const handleSelectResponse = (response: string) => {
    if (isAgentMode) {
      addAgentMessage(response);
      processAgentResponse(response);
    } else {
      addCustomerMessage(response);
      physioCoverage.processEvent(response);
    }
  };

  // Handle sending a custom message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    if (isAgentMode) {
      addAgentMessage(inputValue);
    } else {
      addCustomerMessage(inputValue);
    }
    
    setInputValue('');
    // Not processing any event, just for free text input
  };

  // Handle toggling the agent mode
  const handleToggleAgentMode = () => {
    if (callActive) {
      addSystemMessage("Can't change roles during an active call");
      return;
    }
    setIsAgentMode(!isAgentMode);
  };

  // Handle resetting the scenario
  const handleResetScenario = () => {
    // Only allow reset if call is active
    if (!callActive) return;
    
    // Reset the state machine
    resetConversation();
    
    // Reset all local state
    setMessages([]);
    setPreviousState('');
    setSensitiveDataStats({ validated: 0, pending: 0, invalid: 0 });
    setVerificationBlocking(false);
    
    // Add the initial system message and start the conversation again
    addSystemMessage('Scenario reset');
    startConversation();
    
    // Reset the timer
    startTimeRef.current = Date.now();
    setElapsedTime('00:00');
    
    toast({
      title: "Scenario Reset",
      description: "The conversation has been reset to its initial state",
    });
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
                  <div className="flex items-center gap-4 flex-wrap">
                    {!callActive ? (
                      <Button 
                        onClick={handleStartCall} 
                        className="flex items-center gap-1"
                      >
                        <PhoneCall size={16} />
                        Start Test Call
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Clock size={14} className="text-red-500" />
                          {elapsedTime}
                        </span>
                        <Button 
                          onClick={handleEndCall} 
                          variant="destructive"
                          className="flex items-center gap-1"
                        >
                          <PhoneOff size={16} />
                          End Test Call
                        </Button>
                        <Button 
                          onClick={handleResetScenario}
                          variant="outline" 
                          className="flex items-center gap-1"
                        >
                          <RefreshCcw size={16} />
                          Reset Scenario
                        </Button>
                      </div>
                    )}
                  </div>
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

              {callActive && !isLoading && !error && (
                <Card className="flex-1 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Test Conversation</CardTitle>
                      <CardDescription>
                        Current state: {currentState}
                        {verificationBlocking && (
                          <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-700">
                            Waiting for verification
                          </Badge>
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
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Tabs defaultValue="chat" className="w-full">
                      <TabsList className="grid grid-cols-3 mx-4 mt-4">
                        <TabsTrigger value="chat">Chat View</TabsTrigger>
                        <TabsTrigger value="state">State Machine</TabsTrigger>
                        <TabsTrigger value="visualization">Decision Tree</TabsTrigger>
                      </TabsList>
                      <TabsContent value="chat" className="p-4 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-4 mb-4">
                          {messages.map((message) => (
                            <div 
                              key={message.id}
                              className={`p-3 rounded-lg ${
                                message.sender === 'agent' 
                                  ? 'bg-primary/10 ml-4' 
                                  : message.sender === 'customer' 
                                  ? 'bg-secondary/20 mr-4' 
                                  : 'bg-muted text-center italic text-sm'
                              }`}
                            >
                              <p className="text-xs font-semibold mb-1">
                                {message.sender === 'agent' ? 'Agent' : 
                                 message.sender === 'customer' ? 'Customer' : 'System'}
                                {isAgentMode && message.sender === 'agent' && " (You)"}
                                {!isAgentMode && message.sender === 'customer' && " (You)"}
                              </p>
                              <p>{message.text}</p>

                              {/* Show verification button if needed */}
                              {message.requiresVerification && !message.isVerified && (
                                <div className="mt-2 p-2 rounded bg-yellow-50 border border-yellow-200">
                                  <p className="text-sm text-yellow-700 mb-1">This requires manual verification to continue</p>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleVerifySystemCheck(message.id)}
                                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                  >
                                    Verify and Continue
                                  </Button>
                                </div>
                              )}

                              {message.isVerified && message.requiresVerification && (
                                <div className="mt-2 flex items-center gap-1 text-green-700">
                                  <Check size={14} />
                                  <span className="text-xs">Verified</span>
                                </div>
                              )}

                              {/* Show sensitive data validation UI */}
                              {message.sensitiveData && message.sensitiveData.length > 0 && message.sender === 'customer' && (
                                <div className="mt-3 pt-2 border-t border-gray-300/30">
                                  <div className="text-xs flex items-center gap-1 mb-2">
                                    <Shield size={14} className="text-primary" />
                                    <span className="font-medium">Sensitive Data Detected</span>
                                  </div>
                                  <div className="space-y-2">
                                    {message.sensitiveData.map((field) => (
                                      <div key={field.id} className={`p-2 rounded text-sm border ${
                                        field.status === 'valid'
                                          ? 'bg-green-50 border-green-200 text-green-800'
                                          : field.status === 'invalid'
                                          ? 'bg-red-50 border-red-200 text-red-800'
                                          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                                      }`}>
                                        <div className="flex justify-between">
                                          <span>{field.type}: <strong>{field.value}</strong></span>
                                          <span className="capitalize text-xs font-medium">{field.status}</span>
                                        </div>
                                        
                                        {field.notes && (
                                          <p className="mt-1 text-xs opacity-70">{field.notes}</p>
                                        )}
                                        
                                        {field.status === 'pending' && (
                                          <div className="flex gap-2 mt-2">
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              className="text-xs h-7 bg-green-50 hover:bg-green-100 border-green-200 text-green-800"
                                              onClick={() => handleValidateSensitiveData(message.id, field.id, 'valid')}
                                            >
                                              Valid
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-xs h-7 bg-red-50 hover:bg-red-100 border-red-200 text-red-800"
                                              onClick={() => handleValidateSensitiveData(message.id, field.id, 'invalid')}
                                            >
                                              Invalid
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {message.responseOptions && message.responseOptions.length > 0 && (
                                (isAgentMode && message.sender === 'agent' && !message.text || 
                                 !isAgentMode && message.sender === 'agent') && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {message.responseOptions.map((option) => (
                                      <Button 
                                        key={option} 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleSelectResponse(option)}
                                      >
                                        {option}
                                      </Button>
                                    ))}
                                  </div>
                                )
                              )}
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>

                        <div className="py-2 border-t">
                          <div className="flex gap-2">
                            <Input 
                              placeholder={`Type your own ${isAgentMode ? 'agent' : 'customer'} response...`} 
                              value={inputValue} 
                              onChange={(e) => setInputValue(e.target.value)} 
                              className="flex-1"
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button 
                              type="submit" 
                              onClick={handleSendMessage}
                              disabled={!inputValue.trim() || verificationBlocking}
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="state" className="p-4 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-4">
                          <div className="bg-muted p-3 rounded-lg">
                            <h3 className="font-medium">Current State</h3>
                            <p className="text-sm mt-1">{currentState}</p>
                          </div>
                          <div className="bg-muted p-3 rounded-lg">
                            <h3 className="font-medium">Available Options</h3>
                            <div className="mt-2 space-y-1">
                              {isAgentMode ? 
                                getAgentOptions().map((option) => (
                                  <p key={option} className="text-sm">{option}</p>
                                )) :
                                physioCoverage.getSuggestions().map((suggestion) => (
                                  <p key={suggestion} className="text-sm">{suggestion}</p>
                                ))
                              }
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="visualization" className="p-4">
                        <DecisionTreeVisualizer 
                          stateMachine={loadedStateMachine}
                          currentState={currentState}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Display the state machine visualizer when not in a call */}
              {!callActive && selectedStateMachine && (
                <Card>
                  <CardHeader>
                    <CardTitle>State Machine: {selectedStateMachine}</CardTitle>
                    <CardDescription>
                      Visual representation of the selected state machine
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DecisionTreeVisualizer stateMachine={loadedStateMachine} />
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
