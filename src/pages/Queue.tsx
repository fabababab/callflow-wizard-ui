
import React from 'react';
import { HeadphonesIcon, Phone, Clock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const Queue = () => {
  const queueStats = {
    activeAgents: 12,
    waitingCalls: 18,
    averageWaitTime: '3m 45s',
    serviceLevelToday: 82
  };

  const queuedCalls = [
    {
      id: 1,
      customerName: 'Emma Wagner',
      phoneNumber: '+49 123 987 6543',
      waitTime: '5m 32s',
      callType: 'Technical Support',
      priority: 'high'
    },
    {
      id: 2,
      customerName: 'Max Hoffmann',
      phoneNumber: '+49 234 876 5432',
      waitTime: '4m 15s',
      callType: 'Account Services',
      priority: 'medium'
    },
    {
      id: 3,
      customerName: 'Sophie Becker',
      phoneNumber: '+49 345 765 4321',
      waitTime: '3m 47s',
      callType: 'Billing',
      priority: 'high'
    },
    {
      id: 4,
      customerName: 'Felix Schulz',
      phoneNumber: '+49 456 654 3210',
      waitTime: '2m 23s',
      callType: 'General Inquiry',
      priority: 'low'
    },
    {
      id: 5,
      customerName: 'Laura Meyer',
      phoneNumber: '+49 567 543 2109',
      waitTime: '1m 58s',
      callType: 'Technical Support',
      priority: 'medium'
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

              <Card>
                <CardHeader>
                  <CardTitle>Queue Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {queuedCalls.map(call => (
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
                          </div>
                          <Button size="sm" className="gap-2">
                            Accept <ArrowRight size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Queue;
