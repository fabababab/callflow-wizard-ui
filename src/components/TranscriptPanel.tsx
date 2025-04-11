import React, { useRef, useEffect, useState } from 'react';
import { Mic, CornerDownLeft, PhoneCall, PhoneOff, User, Clock, ArrowRight, Star, UserCircle, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScenarioType } from './ScenarioSelector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Message = {
  id: number;
  text: string;
  sender: 'agent' | 'customer';
  timestamp: string;
};

type IncomingCall = {
  id: number;
  customerName: string;
  phoneNumber: string;
  waitTime: string;
  callType: string;
  priority: 'high' | 'medium' | 'low';
  expertise: string;
  matchScore: number;
}

type PreCall = {
  id: number;
  timestamp: string;
  agent: string;
  content: string;
  response: string;
  customerName: string;
  callType: string;
}

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ activeScenario }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [acceptedCallId, setAcceptedCallId] = useState<number | null>(null);
  const [expandedPreCallId, setExpandedPreCallId] = useState<number | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("incomingCalls");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Sample incoming calls data
  const incomingCalls: IncomingCall[] = [
    {
      id: 1,
      customerName: 'Emma Wagner',
      phoneNumber: '+49 123 987 6543',
      waitTime: '3m 12s',
      callType: 'Technical Support',
      priority: 'high',
      expertise: 'Network Issues',
      matchScore: 95
    },
    {
      id: 2,
      customerName: 'Max Hoffmann',
      phoneNumber: '+49 234 876 5432',
      waitTime: '2m 35s',
      callType: 'Account Services',
      priority: 'medium',
      expertise: 'Billing',
      matchScore: 72
    },
    {
      id: 3,
      customerName: 'Sophie Becker',
      phoneNumber: '+49 345 765 4321',
      waitTime: '1m 47s',
      callType: 'Technical Support',
      priority: 'high',
      expertise: 'Software Setup',
      matchScore: 88
    }
  ];

  // Sample pre-calls data
  const preCalls: PreCall[] = [
    {
      id: 1,
      timestamp: '14:32:15',
      agent: 'RoboVoice',
      content: "Hello, I'm having trouble with my internet connection. It keeps dropping every few minutes.",
      response: "I understand that's frustrating. Can you tell me when this issue started and if you've already tried restarting your router?",
      customerName: 'Emma Wagner',
      callType: 'Technical Support'
    },
    {
      id: 2,
      timestamp: '14:33:20',
      agent: 'RoboVoice',
      content: "It started yesterday evening. Yes, I've tried restarting the router multiple times but it doesn't help.",
      response: "Thank you for that information. Have you noticed if any specific activities cause the connection to drop more frequently?",
      customerName: 'Emma Wagner',
      callType: 'Technical Support'
    },
    {
      id: 3,
      timestamp: '14:34:45',
      agent: 'Technical Agent Maria',
      content: "It seems to happen more when I'm on video calls or streaming videos.",
      response: "That suggests it might be related to bandwidth usage. I'll make a note of this and transfer you to one of our network specialists who can help diagnose the issue further.",
      customerName: 'Emma Wagner',
      callType: 'Technical Support'
    }
  ];
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Timer for call duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (callActive && callStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - callStartTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [callActive, callStartTime]);

  // Reset messages when scenario changes
  useEffect(() => {
    if (callActive && activeScenario) {
      // Reset message history
      setMessages([]);
      
      // Add initial agent greeting
      setTimeout(() => {
        const initialMessage: Message = {
          id: 1,
          text: "Hello, thank you for calling customer service. How can I help you today?",
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([initialMessage]);
        
        // Add scenario-specific customer response
        setTimeout(() => {
          let customerResponse = "";
          
          switch (activeScenario) {
            case 'verification':
              customerResponse = "Hi, this is Michael Schmidt. I need to verify my account details.";
              break;
            case 'bankDetails':
              customerResponse = "Hello, I need to update my bank details for my account.";
              break;
            case 'accountHistory':
              customerResponse = "Hello, I'd like to check my recent account activity.";
              break;
            default:
              customerResponse = "Hello, I have some questions about my account.";
          }
          
          const customerMessage: Message = {
            id: 2,
            text: customerResponse,
            sender: 'customer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages(prev => [...prev, customerMessage]);
        }, 1500);
      }, 1000);
    }
  }, [activeScenario, callActive]);

  // Trigger contact suggestion based on keywords in the transcript
  useEffect(() => {
    if (callActive && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'customer') {
        const keywords = ['my name is', 'this is', 'speaking', 'michael', 'schmidt'];
        const text = lastMessage.text.toLowerCase();
        const hasKeyword = keywords.some(keyword => text.includes(keyword.toLowerCase()));
        
        if (hasKeyword && !document.getElementById('contact-identified')) {
          // Simulate that system identified the contact
          const event = new CustomEvent('contact-identified', {
            detail: { name: 'Michael Schmidt', confidence: 0.89 }
          });
          window.dispatchEvent(event);
          
          toast({
            title: "Contact Identified",
            description: "Michael Schmidt identified with 89% confidence",
          });
        }
      }
    }
  }, [messages, callActive, toast]);
  
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
      
      // Simulate customer response after a short delay
      if (messages.length % 2 === 0 || messages.length === 0) {
        setTimeout(() => {
          let customerResponse = "";
          
          // Scenario-specific responses
          if (activeScenario === 'bankDetails') {
            const bankResponses = [
              "Yes, I'd like to change my bank from Deutsche Bank to Commerzbank.",
              "My new IBAN is DE89370400440532013001.",
              "Yes, that's correct. I recently switched banks.",
              "Thank you for updating my information."
            ];
            customerResponse = bankResponses[Math.min(Math.floor(messages.length / 2), bankResponses.length - 1)];
          } else if (activeScenario === 'verification') {
            const verificationResponses = [
              "Yes, that's right. My name is Michael Schmidt.",
              "I was born on March 15, 1985.",
              "My address is Hauptstrasse 123, Berlin.",
              "The last four digits of my account are 4321."
            ];
            customerResponse = verificationResponses[Math.min(Math.floor(messages.length / 2), verificationResponses.length - 1)];
          } else {
            // Default or account history responses
            const defaultResponses = [
              "I'd like to know about my recent transactions.",
              "Yes, specifically the last three months.",
              "I don't recognize a transaction from last week.",
              "It was a payment to Online Shop GmbH for €79.99.",
              "Thank you for your help."
            ];
            customerResponse = defaultResponses[Math.min(Math.floor(messages.length / 2), defaultResponses.length - 1)];
          }
          
          const customerMessage: Message = {
            id: messages.length + 2,
            text: customerResponse,
            sender: 'customer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages(prev => [...prev, customerMessage]);
        }, 1500);
      }
    }
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };
  
  const handleCall = () => {
    if (!callActive) {
      // Start call
      setCallActive(true);
      setCallStartTime(new Date());
      toast({
        title: "Incoming Call",
        description: "Call from +49 123 456 7890",
      });
      
      // Add initial agent greeting after a brief delay
      setTimeout(() => {
        const initialMessage: Message = {
          id: 1,
          text: "Hello, thank you for calling customer service. How can I help you today?",
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([initialMessage]);
      }, 1000);
    } else {
      // End call
      setCallActive(false);
      setCallStartTime(null);
      setElapsedTime('00:00');
      toast({
        title: "Call Ended",
        description: `Call duration: ${elapsedTime}`,
      });
    }
  };

  const handleAcceptCall = (callId: number) => {
    setAcceptedCallId(callId);
    setCallActive(true);
    setCallStartTime(new Date());
    setCurrentTab("transcript");
    
    const call = incomingCalls.find(call => call.id === callId);
    
    toast({
      title: "Call Accepted",
      description: `You are now connected with ${call?.customerName}`,
    });
    
    // Add initial agent greeting after a brief delay
    setTimeout(() => {
      const initialMessage: Message = {
        id: 1,
        text: `Hello ${call?.customerName}, thank you for calling customer service. I understand you need help with ${call?.expertise}. How can I assist you today?`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialMessage]);
    }, 1000);
  };

  const togglePreCallExpansion = (id: number) => {
    setExpandedPreCallId(expandedPreCallId === id ? null : id);
  };

  const renderIncomingCalls = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-2">Waiting calls recommended for you based on expertise match</p>
      {incomingCalls.map(call => (
        <div 
          key={call.id} 
          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-callflow-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-callflow-primary">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-medium">{call.customerName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{call.phoneNumber}</span>
                <span>•</span>
                <span>{call.callType}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-muted-foreground" />
                <span className="text-sm">{call.waitTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                <span className="text-sm">{call.matchScore}% match</span>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={
                `text-xs font-normal ${
                  call.priority === 'high'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : call.priority === 'medium'
                    ? 'bg-callflow-accent/10 text-callflow-accent border-callflow-accent/20'
                    : 'bg-callflow-muted-text/10 text-callflow-muted-text border-callflow-muted-text/20'
                }`
              }
            >
              {call.priority} priority
            </Badge>
            <Button 
              size="sm" 
              className="gap-2"
              onClick={() => handleAcceptCall(call.id)}
            >
              Accept <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPreCalls = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-2">Previous interactions with automated systems and agents</p>
      <div className="space-y-3">
        {preCalls.map(preCall => (
          <Collapsible 
            key={preCall.id}
            open={expandedPreCallId === preCall.id}
            onOpenChange={() => togglePreCallExpansion(preCall.id)}
            className="border rounded-md"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex justify-between items-center p-3 h-auto">
                <div className="flex items-center gap-2 text-left">
                  <UserCircle size={18} />
                  <div>
                    <span className="font-medium">{preCall.agent}</span>
                    <p className="text-xs text-muted-foreground">{preCall.timestamp}</p>
                  </div>
                </div>
                <MessageSquare size={16} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 pt-0 border-t bg-muted/30">
              <div className="text-sm mb-2">
                <p className="font-medium">Customer:</p>
                <p>{preCall.content}</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">{preCall.agent}:</p>
                <p>{preCall.response}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );

  const renderTranscript = () => (
    <>
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.length === 0 && !callActive ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <PhoneCall size={48} className="mx-auto mb-2 opacity-20" />
              <p>No active call</p>
              <p className="text-sm">Click "Simulate Call" to start</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {callActive && acceptedCallId && (
              <div className="mb-6 pb-4 border-b">
                <div className="px-4 py-2 mb-2 bg-muted/30 text-sm font-medium rounded-lg inline-block">
                  Previous conversation history with {incomingCalls.find(call => call.id === acceptedCallId)?.customerName}
                </div>
                
                {preCalls.map((preCall) => (
                  <div key={`precall-${preCall.id}`} className="space-y-3">
                    <div className="chat-message customer-message flex items-start space-x-2 mb-2">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-callflow-accent/20 text-callflow-accent">
                          {preCall.customerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{preCall.customerName}</span>
                          <span className="text-xs text-muted-foreground">{preCall.timestamp}</span>
                        </div>
                        <div className="bg-muted/30 px-4 py-2 rounded-lg text-sm mt-1">
                          {preCall.content}
                        </div>
                      </div>
                    </div>
                    
                    <div className="chat-message agent-message flex items-start space-x-2 mb-2 justify-end">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{preCall.timestamp}</span>
                          <span className="font-medium text-sm">{preCall.agent}</span>
                        </div>
                        <div className="bg-callflow-primary/10 text-callflow-primary px-4 py-2 rounded-lg text-sm mt-1">
                          {preCall.response}
                        </div>
                      </div>
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-callflow-primary/20 text-callflow-primary">
                          {preCall.agent.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                ))}
                
                <div className="px-4 py-2 my-4 bg-green-100 text-green-700 text-sm font-medium rounded-lg inline-block">
                  You are now connected with {incomingCalls.find(call => call.id === acceptedCallId)?.customerName}
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`chat-message flex items-start ${message.sender === 'agent' ? 'justify-end' : ''} mb-4`}
              >
                {message.sender === 'customer' && (
                  <Avatar className="h-8 w-8 mt-1 mr-2">
                    <AvatarFallback className="bg-callflow-accent/20 text-callflow-accent">
                      {acceptedCallId ? incomingCalls.find(call => call.id === acceptedCallId)?.customerName.charAt(0) : 'C'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-3/4 ${message.sender === 'agent' ? 'text-right' : ''}`}>
                  <div className={`px-4 py-2 rounded-lg text-sm inline-block ${
                    message.sender === 'agent' 
                      ? 'bg-callflow-primary/10 text-callflow-primary' 
                      : 'bg-muted/30'
                  }`}>
                    {message.text}
                  </div>
                  <div className="text-xs opacity-70 mt-1">{message.timestamp}</div>
                </div>
                {message.sender === 'agent' && (
                  <Avatar className="h-8 w-8 mt-1 ml-2">
                    <AvatarFallback className="bg-callflow-primary/20 text-callflow-primary">A</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="border-t pt-4">
        {isRecording && (
          <div className="text-sm mb-2 text-callflow-danger flex items-center">
            <span className="recording-dot"></span>
            Recording...
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            size="icon" 
            variant={isRecording ? "destructive" : "outline"} 
            onClick={toggleRecording}
            disabled={!callActive}
          >
            <Mic size={18} />
          </Button>
          <Input 
            placeholder={callActive ? "Type your message..." : "Start a call to begin"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && callActive) {
                handleSendMessage();
              }
            }}
            disabled={!callActive}
          />
          <Button 
            type="button" 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={!callActive || !inputValue.trim()}
          >
            <CornerDownLeft size={18} />
          </Button>
        </div>
      </div>
    </>
  );
  
  return (
    <Card className="rounded-lg flex flex-col h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Call Center</CardTitle>
        <div className="flex items-center gap-2">
          {callActive && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              {elapsedTime}
            </Badge>
          )}
          {!callActive && !acceptedCallId && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleCall}
              className="gap-1"
            >
              <PhoneCall size={16} />
              Simulate Call
            </Button>
          )}
          {callActive && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleCall}
              className="gap-1"
            >
              <PhoneOff size={16} />
              End Call
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4 grid grid-cols-3 h-10">
            <TabsTrigger value="incomingCalls">Incoming Calls</TabsTrigger>
            <TabsTrigger value="preCalls">Pre-Call History</TabsTrigger>
            <TabsTrigger value="transcript">Live Transcript</TabsTrigger>
          </TabsList>
          
          <TabsContent value="incomingCalls" className="flex-1 overflow-y-auto">
            {renderIncomingCalls()}
          </TabsContent>
          
          <TabsContent value="preCalls" className="flex-1 overflow-y-auto">
            {renderPreCalls()}
          </TabsContent>
          
          <TabsContent value="transcript" className="flex-1 overflow-y-auto flex flex-col">
            {renderTranscript()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TranscriptPanel;
