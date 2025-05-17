
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import DashboardTranscriptPanel from '@/components/dashboard/DashboardTranscriptPanel';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider defaultOpen={true}>
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-0">
            <div className="h-full">
              {/* Content area - only advanced view */}
              <div className="flex-1 h-full">
                <DashboardTranscriptPanel />
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
