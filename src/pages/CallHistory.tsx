
import React from 'react';
import { Calendar, Search, Filter, Clock, Phone, UserIcon, Tag, DownloadIcon, InfoIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const CallHistory = () => {
  const calls = [
    {
      id: 1,
      customerName: 'Michael Schmidt',
      phoneNumber: '+49 123 456 7890',
      date: '11 Apr 2025',
      time: '14:32',
      duration: '04:32',
      callType: 'Customer Support',
      status: 'completed',
      outcome: 'Resolved'
    },
    {
      id: 2,
      customerName: 'Anna Müller',
      phoneNumber: '+49 234 567 8901',
      date: '11 Apr 2025',
      time: '15:47',
      duration: '03:15',
      callType: 'Account Services',
      status: 'completed',
      outcome: 'Escalated'
    },
    {
      id: 3,
      customerName: 'Thomas Weber',
      phoneNumber: '+49 345 678 9012',
      date: '10 Apr 2025',
      time: '16:23',
      duration: '06:49',
      callType: 'Technical Support',
      status: 'completed',
      outcome: 'Resolved'
    },
    {
      id: 4,
      customerName: 'Julia Fischer',
      phoneNumber: '+49 456 789 0123',
      date: '10 Apr 2025',
      time: '09:15',
      duration: '08:22',
      callType: 'Billing',
      status: 'completed',
      outcome: 'Follow-up'
    },
    {
      id: 5,
      customerName: 'Leon Schneider',
      phoneNumber: '+49 567 890 1234',
      date: '9 Apr 2025',
      time: '10:38',
      duration: '02:05',
      callType: 'General Inquiry',
      status: 'completed',
      outcome: 'Resolved'
    },
    {
      id: 6,
      customerName: 'Emma Wagner',
      phoneNumber: '+49 678 901 2345',
      date: '9 Apr 2025',
      time: '11:42',
      duration: '05:18',
      callType: 'Technical Support',
      status: 'completed',
      outcome: 'Resolved'
    },
    {
      id: 7,
      customerName: 'Max Hoffmann',
      phoneNumber: '+49 789 012 3456',
      date: '8 Apr 2025',
      time: '13:15',
      duration: '03:45',
      callType: 'Account Services',
      status: 'completed',
      outcome: 'Follow-up'
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto bg-callflow-background">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Call History</h1>
                  <p className="text-muted-foreground">
                    Review and analyze past customer interactions
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="gap-2">
                    <Calendar size={16} />
                    Date Range
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <DownloadIcon size={16} />
                    Export
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search call history..." 
                    className="pl-8 bg-background"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter size={16} />
                  Filter
                </Button>
              </div>
              
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Calls</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="escalated">Escalated</TabsTrigger>
                  <TabsTrigger value="followup">Follow-up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Calls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-12 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                          <div className="col-span-4">Customer</div>
                          <div className="col-span-2">Date & Time</div>
                          <div className="col-span-2">Duration</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Outcome</div>
                        </div>
                        <div className="divide-y">
                          {calls.map(call => (
                            <div key={call.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/50 transition-colors">
                              <div className="col-span-4 flex items-center gap-3">
                                <div className="bg-callflow-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-callflow-primary">
                                  <UserIcon size={16} />
                                </div>
                                <div>
                                  <div className="font-medium">{call.customerName}</div>
                                  <div className="text-sm text-muted-foreground">{call.phoneNumber}</div>
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-col">
                                <div className="text-sm">{call.date}</div>
                                <div className="text-sm text-muted-foreground">{call.time}</div>
                              </div>
                              <div className="col-span-2 flex items-center gap-1">
                                <Clock size={14} className="text-muted-foreground" />
                                <span>{call.duration}</span>
                              </div>
                              <div className="col-span-2">
                                <Badge variant="outline" className="font-normal border-callflow-muted-text/20">
                                  {call.callType}
                                </Badge>
                              </div>
                              <div className="col-span-2 flex justify-between items-center">
                                <Badge 
                                  variant="outline" 
                                  className={
                                    `font-normal ${
                                      call.outcome === 'Resolved'
                                        ? 'bg-callflow-success/10 text-callflow-success border-callflow-success/20'
                                        : call.outcome === 'Escalated'
                                        ? 'bg-destructive/10 text-destructive border-destructive/20'
                                        : 'bg-callflow-accent/10 text-callflow-accent border-callflow-accent/20'
                                    }`
                                  }
                                >
                                  {call.outcome}
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <InfoIcon size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="resolved" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resolved Calls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-12 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                          <div className="col-span-4">Customer</div>
                          <div className="col-span-2">Date & Time</div>
                          <div className="col-span-2">Duration</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Outcome</div>
                        </div>
                        <div className="divide-y">
                          {calls.filter(call => call.outcome === 'Resolved').map(call => (
                            <div key={call.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/50 transition-colors">
                              <div className="col-span-4 flex items-center gap-3">
                                <div className="bg-callflow-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-callflow-primary">
                                  <UserIcon size={16} />
                                </div>
                                <div>
                                  <div className="font-medium">{call.customerName}</div>
                                  <div className="text-sm text-muted-foreground">{call.phoneNumber}</div>
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-col">
                                <div className="text-sm">{call.date}</div>
                                <div className="text-sm text-muted-foreground">{call.time}</div>
                              </div>
                              <div className="col-span-2 flex items-center gap-1">
                                <Clock size={14} className="text-muted-foreground" />
                                <span>{call.duration}</span>
                              </div>
                              <div className="col-span-2">
                                <Badge variant="outline" className="font-normal border-callflow-muted-text/20">
                                  {call.callType}
                                </Badge>
                              </div>
                              <div className="col-span-2 flex justify-between items-center">
                                <Badge 
                                  variant="outline" 
                                  className="font-normal bg-callflow-success/10 text-callflow-success border-callflow-success/20"
                                >
                                  {call.outcome}
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <InfoIcon size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="escalated" className="mt-4">
                  {/* Similar content for escalated calls */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Escalated Calls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-12 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                          <div className="col-span-4">Customer</div>
                          <div className="col-span-2">Date & Time</div>
                          <div className="col-span-2">Duration</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Outcome</div>
                        </div>
                        <div className="divide-y">
                          {calls.filter(call => call.outcome === 'Escalated').map(call => (
                            <div key={call.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/50 transition-colors">
                              <div className="col-span-4 flex items-center gap-3">
                                <div className="bg-callflow-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-callflow-primary">
                                  <UserIcon size={16} />
                                </div>
                                <div>
                                  <div className="font-medium">{call.customerName}</div>
                                  <div className="text-sm text-muted-foreground">{call.phoneNumber}</div>
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-col">
                                <div className="text-sm">{call.date}</div>
                                <div className="text-sm text-muted-foreground">{call.time}</div>
                              </div>
                              <div className="col-span-2 flex items-center gap-1">
                                <Clock size={14} className="text-muted-foreground" />
                                <span>{call.duration}</span>
                              </div>
                              <div className="col-span-2">
                                <Badge variant="outline" className="font-normal border-callflow-muted-text/20">
                                  {call.callType}
                                </Badge>
                              </div>
                              <div className="col-span-2 flex justify-between items-center">
                                <Badge 
                                  variant="outline" 
                                  className="font-normal bg-destructive/10 text-destructive border-destructive/20"
                                >
                                  {call.outcome}
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <InfoIcon size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="followup" className="mt-4">
                  {/* Similar content for follow-up calls */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Follow-up Calls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-12 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                          <div className="col-span-4">Customer</div>
                          <div className="col-span-2">Date & Time</div>
                          <div className="col-span-2">Duration</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Outcome</div>
                        </div>
                        <div className="divide-y">
                          {calls.filter(call => call.outcome === 'Follow-up').map(call => (
                            <div key={call.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/50 transition-colors">
                              <div className="col-span-4 flex items-center gap-3">
                                <div className="bg-callflow-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-callflow-primary">
                                  <UserIcon size={16} />
                                </div>
                                <div>
                                  <div className="font-medium">{call.customerName}</div>
                                  <div className="text-sm text-muted-foreground">{call.phoneNumber}</div>
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-col">
                                <div className="text-sm">{call.date}</div>
                                <div className="text-sm text-muted-foreground">{call.time}</div>
                              </div>
                              <div className="col-span-2 flex items-center gap-1">
                                <Clock size={14} className="text-muted-foreground" />
                                <span>{call.duration}</span>
                              </div>
                              <div className="col-span-2">
                                <Badge variant="outline" className="font-normal border-callflow-muted-text/20">
                                  {call.callType}
                                </Badge>
                              </div>
                              <div className="col-span-2 flex justify-between items-center">
                                <Badge 
                                  variant="outline" 
                                  className="font-normal bg-callflow-accent/10 text-callflow-accent border-callflow-accent/20"
                                >
                                  {call.outcome}
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <InfoIcon size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CallHistory;
