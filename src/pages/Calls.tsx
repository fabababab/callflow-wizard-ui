
import React from 'react';
import { Phone, Clock, Tag, Calendar, Search, PlusCircle, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const Calls = () => {
  const calls = [
    {
      id: 1,
      customerName: 'Michael Schmidt',
      phoneNumber: '+49 123 456 7890',
      callDuration: '00:04:32',
      callType: 'Customer Support',
      startTime: '14:32',
      date: '11 Apr 2025',
      status: 'completed'
    },
    {
      id: 2,
      customerName: 'Anna Müller',
      phoneNumber: '+49 234 567 8901',
      callDuration: '00:03:15',
      callType: 'Account Services',
      startTime: '15:47',
      date: '11 Apr 2025',
      status: 'active'
    },
    {
      id: 3,
      customerName: 'Thomas Weber',
      phoneNumber: '+49 345 678 9012',
      callDuration: '00:06:49',
      callType: 'Technical Support',
      startTime: '16:23',
      date: '11 Apr 2025',
      status: 'completed'
    },
    {
      id: 4,
      customerName: 'Julia Fischer',
      phoneNumber: '+49 456 789 0123',
      callDuration: '00:08:22',
      callType: 'Billing',
      startTime: '09:15',
      date: '11 Apr 2025',
      status: 'completed'
    },
    {
      id: 5,
      customerName: 'Leon Schneider',
      phoneNumber: '+49 567 890 1234',
      callDuration: '00:02:05',
      callType: 'General Inquiry',
      startTime: '10:38',
      date: '11 Apr 2025',
      status: 'completed'
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Calls</h1>
                  <p className="text-muted-foreground">
                    Manage and review your call history
                  </p>
                </div>
                <Button className="gap-2">
                  <PlusCircle size={16} />
                  New Call
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search calls..." 
                    className="pl-8 bg-background"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter size={16} />
                  Filter
                </Button>
              </div>

              <div className="space-y-4">
                {calls.map(call => (
                  <Card key={call.id} className="hover:bg-accent/5 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-callflow-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-callflow-primary">
                            <Phone size={20} />
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
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={14} className="text-muted-foreground" />
                              <span>{call.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={14} className="text-muted-foreground" />
                              <span>{call.callDuration}</span>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={
                              `font-normal ${call.status === 'active' 
                                ? 'bg-callflow-success/10 text-callflow-success border-callflow-success/20' 
                                : 'bg-callflow-muted-text/10 text-callflow-muted-text border-callflow-muted-text/20'}`
                            }
                          >
                            {call.status === 'active' ? 'Active' : 'Completed'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Calls;
