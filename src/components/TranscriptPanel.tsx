
import React, { useState } from 'react';
import { Mic, CornerDownLeft, PhoneCall, PhoneOff, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScenarioType } from './ScenarioSelector';
import { useTranscript } from '@/hooks/useTranscript';
import Message from './transcript/Message';
import IncomingCallCard from './transcript/IncomingCall';
import PreCallInfo from './transcript/PreCallInfo';
import { incomingCalls, preCalls } from '@/data/scenarioData';

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ activeScenario }) => {
  const [historyCollapsed, setHistoryCollapsed] = useState(true);
  
  const {
    messages,
    inputValue,
    setInputValue,
    isRecording,
    callActive,
    elapsedTime,
    acceptedCallId,
    messagesEndRef,
    handleSendMessage,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    toggleRecording,
    handleCall,
    handleAcceptCall
  } = useTranscript(activeScenario);

  return (
    <Card className="flex flex-col h-full border-none shadow-none">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">Transcript</CardTitle>
          <CardDescription>Call transcript and suggestions</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {callActive ? (
            <>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock size={14} className="text-red-500" />
                <span>{elapsedTime}</span>
              </Badge>
              <Button 
                size="icon" 
                variant="destructive" 
                onClick={handleCall}
                title="End Call"
                className="h-8 w-8"
              >
                <PhoneOff size={16} />
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              variant="default" 
              onClick={handleCall}
              className="h-8"
            >
              <PhoneCall size={16} className="mr-1" />
              Start Call
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {!callActive && !acceptedCallId && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">Incoming Calls</h3>
              {incomingCalls.map((call) => (
                <IncomingCallCard 
                  key={call.id} 
                  call={call} 
                  onAcceptCall={handleAcceptCall} 
                />
              ))}
              
              {/* Pre-call information section */}
              <PreCallInfo preCalls={preCalls} />
            </div>
          )}
          
          {/* Message transcript */}
          {messages.map((message) => (
            <Message 
              key={message.id} 
              message={message} 
              onAcceptSuggestion={handleAcceptSuggestion}
              onRejectSuggestion={handleRejectSuggestion}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {callActive && (
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button 
                size="icon" 
                variant="outline" 
                className={`${isRecording ? 'bg-red-100 text-red-500' : ''} h-9`}
                onClick={toggleRecording}
              >
                <Mic size={16} />
              </Button>
              <Input 
                placeholder="Type your response here..." 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                type="submit" 
                size="icon" 
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="h-9"
              >
                <CornerDownLeft size={16} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptPanel;
