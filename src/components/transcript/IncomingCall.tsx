
import React from 'react';
import { Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export type IncomingCall = {
  id: number;
  customerName: string;
  phoneNumber: string;
  waitTime: string;
  callType: string;
  priority: 'high' | 'medium' | 'low';
  expertise: string;
  matchScore: number;
}

interface IncomingCallProps {
  call: IncomingCall;
  onAcceptCall: (callId: number) => void;
}

const IncomingCallCard: React.FC<IncomingCallProps> = ({ call, onAcceptCall }) => {
  return (
    <Card key={call.id} className="border border-gray-200 shadow-sm">
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
              <AvatarFallback>{call.customerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{call.customerName}</CardTitle>
              <CardDescription className="text-xs">{call.phoneNumber}</CardDescription>
            </div>
          </div>
          <Badge variant={call.priority === 'high' ? "destructive" : call.priority === 'medium' ? "default" : "secondary"}>
            {call.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-1 text-sm">
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Wait: {call.waitTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{call.expertise}</span>
          </div>
        </div>
        <div className="mt-1 text-xs">
          <span>{call.callType}</span>
          <div className="mt-1 flex items-center">
            <span className="text-xs text-muted-foreground">Match Score:</span>
            <div className="ml-1 h-2 w-20 bg-gray-200 rounded-full">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${call.matchScore}%` }}
              />
            </div>
            <span className="ml-1 text-xs font-medium">{call.matchScore}%</span>
          </div>
        </div>
      </CardContent>
      <div className="p-3 pt-0 flex justify-end">
        <Button
          size="sm"
          onClick={() => onAcceptCall(call.id)}
          className="h-8"
        >
          Accept Call
        </Button>
      </div>
    </Card>
  );
};

export default IncomingCallCard;
