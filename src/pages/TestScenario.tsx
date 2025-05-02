import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePhysioCoverageStateMachine } from '@/hooks/usePhysioCoverageStateMachine';
import { useCustomerScenario } from '@/hooks/useCustomerScenario';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Network, FileJson, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { loadStateMachine, StateMachine } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useTranscript } from '@/hooks/useTranscript';
import ChatMessages from '@/components/TestScenario/ChatMessages';
import StateDataDisplay from '@/components/TestScenario/StateDataDisplay';
import MessageInput from '@/components/TestScenario/MessageInput';
import EmptyChat from '@/components/TestScenario/EmptyChat';
import StateMachineSelector from '@/components/StateMachineSelector';
import DecisionTreeVisualizer from '@/components/DecisionTreeVisualizer';
import { useToast } from '@/hooks/use-toast';
import TranscriptPanel from '@/components/TranscriptPanel'; // Properly import TranscriptPanel

const TestScenario = () => {
  const {
    toast
  } = useToast();
  const [isAgentMode, setIsAgentMode] = useState(true); // Default to agent mode (you responding as agent)
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [selectedStateMachine, setSelectedStateMachine] = useState<ScenarioType>("bankDetails");
  const [loadedStateMachine, setLoadedStateMachine] = useState<StateMachine | null>(null);
  const [jsonContent, setJsonContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState("chat");

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
    error
  } = activeScenario;

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
          if (transcript.callActive) {
            transcript.handleHangUpCall();
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
  }, [selectedStateMachine, toast, transcript]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  return <div className="flex h-screen bg-background">
      <SidebarProvider>
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="grid gap-6">
              {/* Main content section with all controls integrated */}
              {loadedStateMachine && <Card className="flex-1 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Call Center Agent Simulator
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        
                        <StateMachineSelector activeStateMachine={selectedStateMachine} onSelectStateMachine={setSelectedStateMachine} disabled={transcript.callActive} />
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Tabs defaultValue="chat" value={activeTab} onValueChange={handleTabChange} className="w-full">
                      <TabsList className="grid grid-cols-3 mx-4 mt-4">
                        <TabsTrigger value="chat" className="flex items-center gap-1">
                          <MessageSquare size={16} />
                          Agent View
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
                      <TabsContent value="chat" className="p-0">
                        {/* We're now properly embedding the TranscriptPanel component directly */}
                        <div className="h-[70vh]">
                          <TranscriptPanel activeScenario={selectedStateMachine} />
                        </div>
                      </TabsContent>
                      <TabsContent value="state" className="p-4 max-h-[60vh] overflow-y-auto">
                        <StateDataDisplay currentState={transcript.currentState || currentState} stateData={transcript.stateData} />
                      </TabsContent>
                      <TabsContent value="visualization" className="p-4">
                        <DecisionTreeVisualizer stateMachine={loadedStateMachine} currentState={transcript.currentState || currentState} onStateClick={state => {
                      console.log("State clicked:", state);
                      // Implementation for state click if needed
                    }} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>}

              {/* Display loading or error states */}
              {isLoading && <Card>
                  <CardContent className="py-4">
                    <p className="text-center">Loading state machine...</p>
                  </CardContent>
                </Card>}

              {error && <Card>
                  <CardContent className="py-4">
                    <p className="text-red-500">{error}</p>
                  </CardContent>
                </Card>}
              
              {!loadedStateMachine && !isLoading && !error && <Card>
                  <CardContent className="py-8 text-center">
                    <p>Please select a state machine to start testing</p>
                  </CardContent>
                </Card>}
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
    </div>;
};
export default TestScenario;