
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  PhoneCall, 
  User, 
  ChevronRight
} from 'lucide-react';

const Escalations = () => {
  const escalations = [
    {
      id: 1,
      customer: "Thomas Weber",
      issue: "Billing dispute requiring supervisor attention",
      priority: "High",
      time: "14:35",
      date: "Today",
      status: "Pending"
    },
    {
      id: 2,
      customer: "Julia Fischer",
      issue: "Complex technical issue with service interruption",
      priority: "Critical",
      time: "11:20",
      date: "Today",
      status: "In Progress"
    },
    {
      id: 3,
      customer: "Michael Schmidt",
      issue: "Repeat complaint about product quality",
      priority: "Medium",
      time: "09:45",
      date: "Today",
      status: "Pending"
    },
    {
      id: 4,
      customer: "Anna Müller",
      issue: "Account closure request with special circumstances",
      priority: "High",
      time: "16:30",
      date: "Yesterday",
      status: "Resolved"
    },
    {
      id: 5,
      customer: "Leon Schneider",
      issue: "Legal compliance concern requiring management input",
      priority: "Critical",
      time: "13:15",
      date: "Yesterday",
      status: "In Progress"
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
                  <h1 className="text-2xl font-bold tracking-tight">Escalations</h1>
                  <p className="text-muted-foreground">
                    Customer issues that require special attention
                  </p>
                </div>
                <Button className="gap-2">
                  <AlertCircle size={16} />
                  New Escalation
                </Button>
              </div>

              <div className="grid gap-6">
                {escalations.map((item) => (
                  <Card key={item.id} className="hover:bg-accent/5 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2 md:w-3/4">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.customer}</h3>
                            <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.issue}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{item.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{item.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:w-1/4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 px-2">
                              <User size={14} />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-2">
                              <PhoneCall size={14} />
                            </Button>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronRight size={18} />
                          </Button>
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

export default Escalations;
