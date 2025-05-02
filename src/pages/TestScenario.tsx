
import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { usePhysioCoverageStateMachine } from '@/hooks/usePhysioCoverageStateMachine';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { nanoid } from 'nanoid';
import { PhoneCall, PhoneOff, Clock } from 'lucide-react';

type Message = {
  id: string;
  text: string;
  sender: 'agent' | 'customer' | 'system';
  timestamp: Date;
  responseOptions?: string[];
};

const TestScenario = () => {
  const [callActive, setCallActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const {
    currentState,
    isLoading,
    error,
    getAgentText,
    getSuggestions,
    getSystemMessage,
    processEvent,
    startConversation,
    resetConversation,
    isFinalState
  } = usePhysioCoverageStateMachine();

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

  // Add a system message
  const addSystemMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: nanoid(),
        text,
        sender: 'system',
        timestamp: new Date()
      }
    ]);
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

  // Add a customer message
  const addCustomerMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: nanoid(),
        text,
        sender: 'customer',
        timestamp: new Date()
      }
    ]);
  };

  // Update messages based on state changes
  useEffect(() => {
    if (!callActive || isLoading) return;

    const agentText = getAgentText();
    const suggestions = getSuggestions();
    const systemMessage = getSystemMessage();

    if (systemMessage) {
      addSystemMessage(systemMessage);
    }

    if (agentText) {
      addAgentMessage(agentText, suggestions);
    }

    // Auto-end call when reaching final state
    if (isFinalState()) {
      setTimeout(() => setCallActive(false), 3000);
    }
  }, [callActive, currentState, isLoading, getAgentText, getSuggestions, getSystemMessage, isFinalState]);

  // Handle starting a call
  const handleStartCall = () => {
    setMessages([]);
    setCallActive(true);
    resetConversation();
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
    addCustomerMessage(response);
    processEvent(response);
  };

  // Handle sending a custom message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    addCustomerMessage(inputValue);
    setInputValue('');
    
    // Not processing any event, just for free text input
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
                <CardHeader>
                  <CardTitle>Physio Coverage Scenario</CardTitle>
                  <CardDescription>
                    Test the physio coverage conversation flow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {!callActive ? (
                      <Button 
                        onClick={handleStartCall} 
                        className="flex items-center gap-1"
                      >
                        <PhoneCall size={16} />
                        Start Test Call
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
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
                  <CardHeader>
                    <CardTitle>Test Conversation</CardTitle>
                    <CardDescription>
                      Current state: {currentState}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Tabs defaultValue="chat" className="w-full">
                      <TabsList className="grid grid-cols-2 mx-4 mt-4">
                        <TabsTrigger value="chat">Chat View</TabsTrigger>
                        <TabsTrigger value="state">State Machine</TabsTrigger>
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
                              </p>
                              <p>{message.text}</p>

                              {message.responseOptions && message.responseOptions.length > 0 && (
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
                              )}
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>

                        <div className="py-2 border-t">
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Type your own response..." 
                              value={inputValue} 
                              onChange={(e) => setInputValue(e.target.value)} 
                              className="flex-1"
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button 
                              type="submit" 
                              onClick={handleSendMessage}
                              disabled={!inputValue.trim()}
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
                              {getSuggestions().map((suggestion) => (
                                <p key={suggestion} className="text-sm">{suggestion}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default TestScenario;
