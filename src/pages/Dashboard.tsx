
import React, { useState } from 'react';
import { HeadphonesIcon, Phone, Clock, User, ArrowRight, AlertCircle, MessageSquare, Star, CheckCircle, UserCircle } from 'lucide-react';
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

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [acceptedCallId, setAcceptedCallId] = useState<number | null>(null);
  const [expandedPreCallId, setExpandedPreCallId] = useState<number | null>(null);

  const dashboardStats = {
    activeAgents: 12,
    waitingCalls: 5,
    averageWaitTime: '2m 45s',
    serviceLevelToday: 87
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

  const handleAcceptCall = (callId: number) => {
    setAcceptedCallId(callId);
    const call = incomingCalls.find(call => call.id === callId);
    
    toast({
      title: "Call Accepted",
      description: `You are now connected with ${call?.customerName}`,
    });
  };

  const togglePreCallExpansion = (id: number) => {
    setExpandedPreCallId(expandedPreCallId === id ? null : id);
  };

  const handleEndCall = () => {
    toast({
      title: "Call Ended",
      description: "Call has been successfully completed",
    });
    setAcceptedCallId(null);
  };

  const handleViewCallDetails = (callId: number) => {
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto bg-callflow-background">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome to the CallFlow Wizard dashboard.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Agents
                    </CardTitle>
                    <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.activeAgents}</div>
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
                    <div className="text-2xl font-bold">{dashboardStats.waitingCalls}</div>
                    <p className="text-xs text-callflow-accent">
                      2 high priority
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
                    <div className="text-2xl font-bold">{dashboardStats.averageWaitTime}</div>
                    <p className="text-xs text-callflow-success">
                      -30s from target
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
                    <div className="text-2xl font-bold">{dashboardStats.serviceLevelToday}%</div>
                    <Progress value={dashboardStats.serviceLevelToday} className="h-2" />
                  </CardContent>
                </Card>
              </div>

              {!acceptedCallId ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Calls for You</CardTitle>
                    <CardDescription>Based on your expertise and call handling history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
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
                                <span className="text-sm">{call.matchScore}% expertise match</span>
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
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-green-500 border-2">
                    <CardHeader className="bg-green-50">
                      <div className="flex justify-between items-center">
                        <CardTitle>Active Call - {incomingCalls.find(c => c.id === acceptedCallId)?.customerName}</CardTitle>
                        <Badge className="bg-green-500">Live</Badge>
                      </div>
                      <CardDescription>{incomingCalls.find(c => c.id === acceptedCallId)?.callType} • {incomingCalls.find(c => c.id === acceptedCallId)?.phoneNumber}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="mb-6">
                        <h3 className="text-sm font-medium mb-2">Pre-Call History</h3>
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
                      
                      <div className="flex gap-3">
                        <Button 
                          variant="default" 
                          className="flex-1"
                          onClick={() => handleViewCallDetails(acceptedCallId)}
                        >
                          View Full Call Details
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          onClick={handleEndCall}
                        >
                          End Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <CheckCircle size={16} />
                          Verify Customer Identity
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <CheckCircle size={16} />
                          Run Network Diagnostics
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <CheckCircle size={16} />
                          Check Recent Account Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
