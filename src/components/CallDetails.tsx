
import React from 'react';
import { User, Phone, Clock, Tag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type CallDetailsProps = {
  customerName: string;
  phoneNumber: string;
  callDuration: string;
  callType: string;
  startTime: string;
  date: string;
};

const CallDetails = ({
  customerName,
  phoneNumber,
  callDuration,
  callType,
  startTime,
  date,
}: CallDetailsProps) => {
  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Call Details</span>
          <Badge variant="outline" className="font-normal bg-callflow-success/10 text-callflow-success border-callflow-success/20">
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-callflow-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-callflow-primary">
              <User size={20} />
            </div>
            <div>
              <p className="font-medium">{customerName}</p>
              <p className="text-sm text-callflow-muted-text">Customer</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-callflow-muted-text" />
              <span className="text-sm">{phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-callflow-muted-text" />
              <span className="text-sm">{callDuration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-callflow-muted-text" />
              <span className="text-sm">{callType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-callflow-muted-text" />
              <span className="text-sm">{date}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2 flex items-center gap-2">
          <Button size="sm" variant="outline" className="w-full">Transfer</Button>
          <Button size="sm" variant="destructive" className="w-full">End Call</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallDetails;
