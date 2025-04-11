
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TranscriptPanel from '@/components/TranscriptPanel';
import CallDetails from '@/components/CallDetails';
import IdentityValidation from '@/components/IdentityValidation';
import ActionPanel from '@/components/ActionPanel';
import CallEvaluation from '@/components/CallEvaluation';

const Index = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto bg-callflow-background">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Main content area - Call transcript */}
            <div className="col-span-12 lg:col-span-7 h-full">
              <TranscriptPanel />
            </div>
            
            {/* Right sidebar with tools and info */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <CallDetails 
                customerName="Michael Schmidt"
                phoneNumber="+49 123 456 7890"
                callDuration="00:04:32"
                callType="Customer Support"
                startTime="14:32"
                date="11 Apr 2025"
              />
              
              <IdentityValidation />
              
              <ActionPanel />
              
              <CallEvaluation />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
