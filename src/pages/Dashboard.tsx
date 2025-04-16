import React from 'react';
import { 
  HeadphonesIcon, 
  Phone, 
  Clock, 
  User,
  ArrowRight, 
  AlertCircle, 
  MessageSquare, 
  Star, 
  CheckCircle, 
  History, 
  FileText,
  UserCircle,
  CornerDownLeft,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SidebarTrigger from '@/components/SidebarTrigger';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [acceptedCallId, setAcceptedCallId] = React.useState<number | null>(null);
  const [expandedPreCallId, setExpandedPreCallId] = React.useState<number | null>(null);
  const [rightSidebarOpen, setRightSidebarOpen] = React.useState(true);
  const [messages, setMessages] = React.useState<Array<{
    id: number;
    text: string;
    sender: 'agent' | 'customer';
    timestamp: string;
  }>>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [callActive, setCallActive] = React.useState(false);
  const [callStartTime, setCallStartTime] = React.useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = React.useState('00:00');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const queueStats = {
    activeAgents: 12,
    waitingCalls: 18,
    averageWaitTime: '3m 45s',
    serviceLevelToday: 82
  };

  const incomingCall = {
    id: 1,
    customerName: 'Emma Wagner',
    phoneNumber: '+49 123 987 6543',
    waitTime: '3m 12s',
    callType: 'Technical Support',
    priority: 'high',
    expertise: 'Network Issues',
    matchScore: 95,
    caseHistory: [
      {
        date: '2025-04-10',
        type: 'Technical Support',
        status: 'Resolved',
        description: 'Router configuration issues'
      },
      {
        date: '2025-03-15',
        type: 'Billing Inquiry',
        status: 'Resolved',
        description: 'Monthly payment adjustment'
      }
    ],
    roboCallSummary: {
      duration: '2m 45s',
      intents: ['Network Connectivity', 'Router Issues'],
      sentiment: 'Frustrated',
      keyPoints: [
        'Internet connection drops frequently',
        'Router has been restarted multiple times',
        'Issues persist for the last 24 hours'
      ]
    }
  };

  const incomingCalls = [
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

  const preCalls = [
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

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
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

  const handleAcceptCall = (callId: number) => {
    setAcceptedCallId(callId);
    setCallActive(true);
    setCallStartTime(new Date());
    const call = incomingCalls.find(call => call.id === callId);
    
    toast({
      title: "Call Accepted",
      description: `You are now connected with ${call?.customerName}`,
    });

    setTimeout(() => {
      const initialMessage = {
        id: 1,
        text: `Hello ${call?.customerName}, thank you for calling technical support. I understand you're experiencing issues with your internet connection. How can I assist you today?`,
        sender: 'agent' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialMessage]);

      setTimeout(() => {
        const customerResponse = {
          id: 2,
          text: "Yes, my internet keeps dropping every few minutes. It's really frustrating, especially during video calls.",
          sender: 'customer' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, customerResponse]);
      }, 2000);
    }, 1000);
  };

  const handleEndCall = () => {
    setCallActive(false);
    setCallStartTime(null);
    setElapsedTime('00:00');
    setAcceptedCallId(null);
    setMessages([]);
    toast({
      title: "Call Ended",
      description: "Call has been successfully completed",
    });
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'agent' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');

      setTimeout(() => {
        const responses = [
          "I've already tried restarting the router multiple times.",
          "Yes, it happens more frequently during video calls.",
          "The issue started yesterday evening.",
          "No other devices are having this problem.",
          "Thank you for your help with this."
        ];
        
        const customerResponse = {
          id: messages.length + 2,
          text: responses[Math.min(Math.floor(messages.length / 2), responses.length - 1)],
          sender: 'customer' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, customerResponse]);
      }, 2000);
    }
  };

  const renderActiveCall = () => (
    <Card className="border-green-500 border-2">
      <CardHeader className="bg-green-50">
        <div className="flex justify-between items-center">
          <CardTitle>Active Call - {incomingCalls.find(c => c.id === acceptedCallId)?.customerName}</CardTitle>
          <Badge className="bg-green-500">Live</Badge>
        </div>
        <CardDescription>
          {incomingCalls.find(c => c.id === acceptedCallId)?.callType} • 
          {incomingCalls.find(c => c.id === acceptedCallId)?.phoneNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex justify-between items-center p-3">
                <span className="font-medium">Pre-Call History</span>
                <ChevronDown size={16} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
              {preCalls.map(preCall => (
                <div key={preCall.id} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCircle size={18} />
                    <span className="font-medium">{preCall.agent}</span>
                    <span className="text-sm text-muted-foreground">{preCall.timestamp}</span>
                  </div>
                  <p className="text-sm">{preCall.content}</p>
                  <p className="text-sm text-muted-foreground mt-2">{preCall.response}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'} items-start gap-2`}
            >
              {message.sender === 'customer' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    {incomingCalls.find(c => c.id === acceptedCallId)?.customerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[80%] ${message.sender === 'agent' ? 'text-right' : ''}`}>
                <div
                  className={`px-4 py-2 rounded-lg text-sm ${
                    message.sender === 'agent'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.text}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {message.timestamp}
                </div>
              </div>
              {message.sender === 'agent' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
            <CornerDownLeft size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto bg-callflow-background relative">
            <div className="absolute right-0 top-0 z-20 mt-4 mr-6">
              <SidebarTrigger />
            </div>
            <div className="p-6 px-4 md:px-6">
              <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className={`col-span-12 ${rightSidebarOpen ? 'lg:col-span-7' : 'lg:col-span-11'} h-full transition-all duration-300`}>
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Current Queue</h1>
                      <p className="text-muted-foreground">
                        Manage incoming calls and call queue
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Active Agents
                          </CardTitle>
                          <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{queueStats.activeAgents}</div>
                          <p className="text-xs text-callflow-success">
                            All agents online
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Waiting Calls
                          </CardTitle>
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{queueStats.waitingCalls}</div>
                          <p className="text-xs text-callflow-accent">
                            3 high priority
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Average Wait Time
                          </CardTitle>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{queueStats.averageWaitTime}</div>
                          <p className="text-xs text-callflow-accent">
                            +45s from target
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Service Level Today
                          </CardTitle>
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{queueStats.serviceLevelToday}%</div>
                          <Progress value={queueStats.serviceLevelToday} className="h-2" />
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                      <p className="text-muted-foreground">
                        Welcome to the CallFlow Wizard dashboard.
                      </p>
                    </div>

                    {!acceptedCallId ? (
                      <Card className="overflow-hidden">
                        <CardHeader>
                          <CardTitle>Priority Call</CardTitle>
                          <CardDescription>Recommended based on your expertise and availability</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-start gap-6 p-4 bg-accent/5 rounded-lg">
                            <div className="bg-callflow-primary/10 w-16 h-16 rounded-full flex items-center justify-center text-callflow-primary shrink-0">
                              <User size={32} />
                            </div>
                            <div className="space-y-4 flex-1">
                              <div>
                                <h3 className="text-xl font-semibold">{incomingCall.customerName}</h3>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone size={16} />
                                  <span>{incomingCall.phoneNumber}</span>
                                  <span>•</span>
                                  <span>{incomingCall.callType}</span>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <h4 className="font-medium flex items-center gap-2">
                                    <History size={16} />
                                    Case History
                                  </h4>
                                  <div className="space-y-2">
                                    {incomingCall.caseHistory.map((case_, index) => (
                                      <div key={index} className="text-sm p-2 bg-background rounded-md">
                                        <div className="flex justify-between">
                                          <span className="font-medium">{case_.type}</span>
                                          <span className="text-muted-foreground">{case_.date}</span>
                                        </div>
                                        <p className="text-muted-foreground mt-1">{case_.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="font-medium flex items-center gap-2">
                                    <FileText size={16} />
                                    Robo-Call Summary
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="p-2 bg-background rounded-md">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">Duration</span>
                                        <span>{incomingCall.roboCallSummary.duration}</span>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="font-medium">Key Points:</p>
                                        <ul className="list-disc list-inside text-muted-foreground">
                                          {incomingCall.roboCallSummary.keyPoints.map((point, index) => (
                                            <li key={index}>{point}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t pt-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Clock size={16} className="text-muted-foreground" />
                                <span>Waiting: {incomingCall.waitTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star size={16} className="text-yellow-500" />
                                <span>{incomingCall.matchScore}% match</span>
                              </div>
                              <Badge 
                                variant="outline" 
                                className="bg-destructive/10 text-destructive border-destructive/20"
                              >
                                High priority
                              </Badge>
                            </div>
                            <Button 
                              size="lg" 
                              className="gap-2"
                              onClick={() => handleAcceptCall(incomingCall.id)}
                            >
                              Accept Call <ArrowRight size={16} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      renderActiveCall()
                    )}

                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <Card className="col-span-1">
                        <CardHeader>
                          <CardTitle>Recent Activity</CardTitle>
                          <CardDescription>
                            Your recent call handling
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                  <Phone size={14} className="text-blue-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Thomas Weber</p>
                                  <p className="text-xs text-muted-foreground">Technical Support</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => navigate('/call-history')}>
                                View
                              </Button>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-full">
                                  <Phone size={14} className="text-green-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Julia Fischer</p>
                                  <p className="text-xs text-muted-foreground">Billing</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => navigate('/call-history')}>
                                View
                              </Button>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-full">
                                  <Phone size={14} className="text-purple-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Leon Schneider</p>
                                  <p className="text-xs text-muted-foreground">General Inquiry</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => navigate('/call-history')}>
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full" onClick={() => navigate('/call-history')}>
                            View All Activity
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card className="col-span-1">
                        <CardHeader>
                          <CardTitle>Your Performance</CardTitle>
                          <CardDescription>
                            Last 7 days metrics
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm">Customer Satisfaction</span>
                                <span className="text-sm font-medium">92%</span>
                              </div>
                              <Progress value={92} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm">First Call Resolution</span>
                                <span className="text-sm font-medium">85%</span>
                              </div>
                              <Progress value={85} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm">Average Handle Time</span>
                                <span className="text-sm font-medium">4m 23s</span>
                              </div>
                              <Progress value={78} className="h-2" />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full" onClick={() => navigate('/stats')}>
                            View Detailed Stats
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </div>
                </div>
                
                <div className={`relative col-span-12 ${rightSidebarOpen ? 'lg:col-span-5' : 'lg:col-span-1 lg:overflow-hidden'} transition-all duration-300`}>
                  <div className={`space-y-3 ${rightSidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'} transition-opacity duration-300`}>
                    {/* Sidebar content */}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
