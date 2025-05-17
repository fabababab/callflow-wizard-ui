
import React, { useState, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ActionPanel from '@/components/ActionPanel';
import { Button } from '@/components/ui/button';
import NotificationPanel from '@/components/NotificationPanel';
import DashboardTranscriptPanel from '@/components/dashboard/DashboardTranscriptPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [activeView, setActiveView] = useState<'simple' | 'advanced'>('simple');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-0">
            <div className="h-full flex flex-col">
              {/* View toggle */}
              <div className="p-2 bg-white border-b">
                <Tabs 
                  defaultValue={activeView} 
                  onValueChange={(value) => setActiveView(value as 'simple' | 'advanced')}
                  className="w-96 mx-auto"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="simple">Simple View</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced View</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Content area */}
              <div className="flex-1 flex">
                {activeView === 'simple' ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                    <div className="col-span-2">
                      <ActionPanel />
                    </div>
                    <div>
                      <NotificationPanel />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <DashboardTranscriptPanel />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
