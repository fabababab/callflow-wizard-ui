
import React, { useEffect, useState } from 'react';
import { useTranscript } from '@/hooks/useTranscript';
import { ScenarioType } from '@/components/ScenarioSelector';
import { Button } from '@/components/ui/button';
import { Shield, Phone, PhoneOff, RefreshCw, FileJson, AlignLeft, Layers, LayoutDashboard } from 'lucide-react';
import ChatMessages from '@/components/TestScenario/ChatMessages';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScenarioSelector from './ScenarioSelector';
import ModuleContainer from '@/components/modules/ModuleContainer';
import { useConversationSummary } from '@/hooks/useConversationSummary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getStateMachineJson, loadStateMachine, StateMachine } from '@/utils/stateMachineLoader';
import DecisionTreeVisualizer from '@/components/DecisionTreeVisualizer';

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  activeScenario
}) => {
  // Use the transcript hook with the active scenario
  const transcript = useTranscript(activeScenario);
  const { generateSummary } = useConversationSummary();
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState("");
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [conversationSummary, setConversationSummary] = useState<string>("");
  const [isLoadingJson, setIsLoadingJson] = useState(false);
  const [dialogViewMode, setDialogViewMode] = useState<"json" | "visualization">("json");
  const [loadedStateMachine, setLoadedStateMachine] = useState<StateMachine | null>(null);
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);

  // Update summary when scenario changes
  useEffect(() => {
    setConversationSummary(generateSummary(activeScenario));
  }, [activeScenario, generateSummary]);

  // Scroll to bottom whenever messages are updated
  useEffect(() => {
    if (transcript.messagesEndRef.current && activeTab === "chat") {
      transcript.messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [transcript.lastTranscriptUpdate, activeTab]);

  // Function to handle scenario changes
  const handleScenarioChange = (newScenario: ScenarioType) => {
    if (activeScenario !== newScenario) {
      // Dispatch custom event for scenario change
      const event = new CustomEvent('scenario-change', {
        detail: {
          scenario: newScenario
        }
      });
      window.dispatchEvent(event);
      // Update conversation summary
      setConversationSummary(generateSummary(newScenario));
    }
  };

  // Handle module completion
  const handleModuleComplete = (result: any) => {
    console.log('Module completed with result:', result);
    transcript.handleModuleComplete(result);
  };

  // Updated to correctly handle inline module completion
  const handleInlineModuleComplete = (messageId: string, moduleId: string, result: any) => {
    transcript.handleInlineModuleComplete(messageId, moduleId, result);
  };

  // Handle state selection from the visualizer
  const handleStateSelection = (state: string) => {
    console.log(`State selected: ${state}`);
    setSelectedState(state);
    
    // Update JSON content to show the selected state
    if (loadedStateMachine && loadedStateMachine.states[state]) {
      setJsonContent(JSON.stringify(loadedStateMachine.states[state], null, 2));
    }
  };

  // Function to load and show JSON dialog
  const handleViewJson = async () => {
    if (!activeScenario) return;
    
    setIsLoadingJson(true);
    try {
      // Load the state machine for visualization
      const machine = await loadStateMachine(activeScenario);
      setLoadedStateMachine(machine);
      
      const json = transcript.currentState ? 
        transcript.getStateJson(transcript.currentState) :
        await getStateMachineJson(activeScenario);
      
      setJsonContent(json);
      setSelectedState(transcript.currentState);
      setJsonDialogOpen(true);
    } catch (error) {
      console.error("Failed to load JSON:", error);
      setJsonContent(JSON.stringify({ error: "Failed to load state machine JSON" }, null, 2));
    } finally {
      setIsLoadingJson(false);
    }
  };

  // Toggle view mode between JSON and visualization
  const handleViewModeToggle = (mode: "json" | "visualization") => {
    setDialogViewMode(mode);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-slate-50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Scenario selector */}
            <ScenarioSelector activeScenario={activeScenario} onSelectScenario={handleScenarioChange} />
            
            {/* Reset button */}
            <Button variant="outline" size="icon" onClick={transcript.resetConversation} title="Reset conversation">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* JSON button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewJson} 
              className="flex items-center gap-1"
              disabled={isLoadingJson}
            >
              <FileJson className="h-4 w-4 mr-1" />
              JSON
            </Button>
            
            {/* Call button */}
            <Button 
              size="sm" 
              variant={transcript.callActive ? "destructive" : "default"}
              onClick={transcript.handleCall}
              className="min-w-[100px]"
            >
              {transcript.callActive ? 
                <>
                  <PhoneOff className="h-3.5 w-3.5 mr-1" /> End Call
                </> : 
                <>
                  <Phone className="h-3.5 w-3.5 mr-1" /> Start Call
                </>
              }
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              <span>Chat View</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-1">
              <AlignLeft className="h-4 w-4" />
              <span>Text Summary</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chat" className="flex-grow overflow-auto p-0 m-0">
          <ScrollArea className="flex-grow p-4">
            {/* Verification banner */}
            {transcript.verificationBlocking && 
              <Card className="mb-4 bg-amber-50 border border-amber-200 shadow-sm">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Shield size={16} />
                    <span className="text-sm font-medium">Verification required to continue</span>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                    Pending
                  </Badge>
                </div>
              </Card>
            }
            
            {/* Chat messages */}
            <ChatMessages
              messages={transcript.messages}
              onSelectResponse={transcript.handleSelectResponse}
              onVerifySystemCheck={transcript.handleVerifySystemCheck}
              onValidateSensitiveData={transcript.handleValidateSensitiveData}
              messagesEndRef={transcript.messagesEndRef}
              onModuleComplete={handleInlineModuleComplete}
            />
            
            {/* Show module if active */}
            {transcript.activeModule && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <ModuleContainer
                  moduleConfig={transcript.activeModule}
                  onClose={() => transcript.completeModule({ cancelled: true })}
                  onComplete={handleModuleComplete}
                  currentState={transcript.currentState}
                  stateData={transcript.stateData}
                />
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="summary" className="flex-grow p-4 overflow-auto">
          <Card>
            <ScrollArea className="h-[calc(100vh-200px)] p-4">
              <h3 className="text-lg font-semibold mb-2">Call Summary</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeScenario ? `Scenario: ${activeScenario}` : 'No scenario selected'}
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-medium">Conversation Overview</h4>
                  <p className="text-sm mt-1">{conversationSummary}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Key Points</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Customer identity was verified</li>
                    <li>Customer's concern was acknowledged</li>
                    <li>Relevant information was provided</li>
                    <li>Follow-up actions were agreed upon</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Agent Actions</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>
                      <span>Identity verification</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>
                      <span>Information provision</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>
                      <span>Issue resolution</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>
                      <span>Next steps explained</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* JSON dialog with visualization toggle */}
      <Dialog open={jsonDialogOpen} onOpenChange={setJsonDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              State Machine for {activeScenario}
              {transcript.currentState && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  (Current state: {transcript.currentState})
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {dialogViewMode === "json" 
                ? "Complete JSON representation of the state machine flow" 
                : "Visual representation of the state machine flow"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Button 
              variant={dialogViewMode === "json" ? "secondary" : "outline"} 
              size="sm"
              onClick={() => handleViewModeToggle("json")}
              className="flex items-center gap-2"
            >
              <FileJson size={16} />
              JSON View
            </Button>
            <Button 
              variant={dialogViewMode === "visualization" ? "secondary" : "outline"} 
              size="sm"
              onClick={() => handleViewModeToggle("visualization")}
              className="flex items-center gap-2"
            >
              <LayoutDashboard size={16} />
              Visualization
            </Button>
          </div>
          
          <div className="overflow-auto max-h-[60vh]">
            {dialogViewMode === "json" ? (
              <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-x-auto">
                {jsonContent}
              </pre>
            ) : (
              <div className="bg-white p-4 rounded-md">
                <DecisionTreeVisualizer 
                  stateMachine={loadedStateMachine} 
                  currentState={selectedState}
                  onStateClick={handleStateSelection}
                />
                
                {/* Display Selected State Details */}
                {selectedState && loadedStateMachine?.states[selectedState] && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">State: {selectedState}</h3>
                    
                    {loadedStateMachine.states[selectedState].meta?.systemMessage && (
                      <div className="mb-3 p-2 rounded bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-1 text-blue-700 text-sm font-medium mb-1">
                          <Shield size={16} />
                          <span>System Message</span>
                        </div>
                        <p className="text-sm">{loadedStateMachine.states[selectedState].meta?.systemMessage}</p>
                      </div>
                    )}
                    
                    {loadedStateMachine.states[selectedState].meta?.customerText && (
                      <div className="mb-3 p-2 rounded bg-amber-50 border border-amber-200">
                        <div className="flex items-center gap-1 text-amber-700 text-sm font-medium mb-1">
                          <Shield size={16} />
                          <span>Customer Text</span>
                        </div>
                        <p className="text-sm">{loadedStateMachine.states[selectedState].meta?.customerText}</p>
                      </div>
                    )}
                    
                    {loadedStateMachine.states[selectedState].meta?.agentText && (
                      <div className="mb-3 p-2 rounded bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-1 text-emerald-700 text-sm font-medium mb-1">
                          <Shield size={16} />
                          <span>Agent Text</span>
                        </div>
                        <p className="text-sm">{loadedStateMachine.states[selectedState].meta?.agentText}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TranscriptPanel;
