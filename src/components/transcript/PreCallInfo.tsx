
import React, { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export type PreCall = {
  id: number;
  timestamp: string;
  agent: string;
  content: string;
  response: string;
  customerName: string;
  callType: string;
}

interface PreCallInfoProps {
  preCalls: PreCall[];
}

const PreCallInfo: React.FC<PreCallInfoProps> = ({ preCalls }) => {
  const [historyCollapsed, setHistoryCollapsed] = useState(true);

  return (
    <Collapsible
      open={!historyCollapsed}
      onOpenChange={setHistoryCollapsed}
      className="bg-gray-50 rounded-md p-2"
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer p-2">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-primary" />
            <span className="font-medium">Pre-Call Information</span>
          </div>
          {historyCollapsed ? (
            <ChevronDown size={16} className="text-muted-foreground" />
          ) : (
            <ChevronUp size={16} className="text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-3">
        {preCalls.map((preCall) => (
          <div key={preCall.id} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">{preCall.timestamp} - {preCall.agent}</span>
              <Badge variant="outline" className="text-xs">{preCall.callType}</Badge>
            </div>
            <p className="text-sm mb-1 pl-2 border-l-2 border-gray-300">
              {preCall.content}
            </p>
            <p className="text-sm mb-1 pl-2 mt-2 border-l-2 border-primary text-primary">
              {preCall.response}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <UserCircle size={12} />
              <span>{preCall.customerName}</span>
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PreCallInfo;
