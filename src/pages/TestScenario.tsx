
import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ScenarioType, ScenarioSelector } from '@/components/ScenarioSelector'; 
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useStateMachine } from '@/hooks/useStateMachine';
import { useMessageHandling } from '@/hooks/useMessageHandling';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TestScenario = () => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType | null>(null);
  const [callActive, setCallActive] = useState(false);
  
  const { 
    currentState, 
    stateData, 
    isLoading, 
    error, 
    processSelection, 
    processDefaultTransition,
    resetStateMachine 
  } = useStateMachine(activeScenario || '');

  const {
    messages,
    inputValue,
    setInputValue,
    isRecording,
    messagesEndRef,
    handleSendMessage,
    handleSelectResponse,
    toggleRecording,
    addSystemMessage
  } = useMessageHandling({
    stateData,
    onProcessSelection: processSelection,
    onDefaultTransition: processDefaultTransition,
    callActive
  });

  const handleStartCall = () => {
    setCallActive(true);
    resetStateMachine();
    addSystemMessage('Call started', 'info');
  };

  const handleEndCall = () => {
    setCallActive(false);
    addSystemMessage('Call ended', 'info');
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Test Scenario" />
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="grid gap-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Scenario Selection</CardTitle>
                  <CardDescription>
                    Select a scenario to test the conversation flow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScenarioSelector 
                    activeScenario={activeScenario} 
                    onChange={setActiveScenario}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  {!callActive ? (
                    <Button 
                      onClick={handleStartCall} 
                      disabled={!activeScenario}
                      className="w-full"
                    >
                      Start Test Call
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleEndCall} 
                      variant="destructive"
                      className="w-full"
                    >
                      End Test Call
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>

            {callActive && activeScenario && (
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
                    </TabsContent>
                    <TabsContent value="state" className="p-4 max-h-[60vh] overflow-y-auto">
                      <div className="space-y-4">
                        <div className="bg-muted p-3 rounded-lg">
                          <h3 className="font-medium">Current State</h3>
                          <p className="text-sm mt-1">{currentState}</p>
                        </div>
                        {stateData && (
                          <div className="bg-muted p-3 rounded-lg">
                            <h3 className="font-medium">State Data</h3>
                            <pre className="text-xs mt-1 whitespace-pre-wrap">
                              {JSON.stringify(stateData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestScenario;
