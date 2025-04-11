
import React, { useRef, useEffect, useState } from 'react';
import { Mic, CornerDownLeft, PhoneCall, PhoneOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScenarioType } from './ScenarioSelector';

type Message = {
  id: number;
  text: string;
  sender: 'agent' | 'customer';
  timestamp: string;
};

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ activeScenario }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Timer for call duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (callActive && callStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - callStartTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [callActive, callStartTime]);

  // Reset messages when scenario changes
  useEffect(() => {
    if (callActive && activeScenario) {
      // Reset message history
      setMessages([]);
      
      // Add initial agent greeting
      setTimeout(() => {
        const initialMessage: Message = {
          id: 1,
          text: "Hello, thank you for calling customer service. How can I help you today?",
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([initialMessage]);
        
        // Add scenario-specific customer response
        setTimeout(() => {
          let customerResponse = "";
          
          switch (activeScenario) {
            case 'verification':
              customerResponse = "Hi, this is Michael Schmidt. I need to verify my account details.";
              break;
            case 'bankDetails':
              customerResponse = "Hello, I need to update my bank details for my account.";
              break;
            case 'accountHistory':
              customerResponse = "Hello, I'd like to check my recent account activity.";
              break;
            default:
              customerResponse = "Hello, I have some questions about my account.";
          }
          
          const customerMessage: Message = {
            id: 2,
            text: customerResponse,
            sender: 'customer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages(prev => [...prev, customerMessage]);
        }, 1500);
      }, 1000);
    }
  }, [activeScenario, callActive]);

  // Trigger contact suggestion based on keywords in the transcript
  useEffect(() => {
    if (callActive && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'customer') {
        const keywords = ['my name is', 'this is', 'speaking', 'michael', 'schmidt'];
        const text = lastMessage.text.toLowerCase();
        const hasKeyword = keywords.some(keyword => text.includes(keyword.toLowerCase()));
        
        if (hasKeyword && !document.getElementById('contact-identified')) {
          // Simulate that system identified the contact
          const event = new CustomEvent('contact-identified', {
            detail: { name: 'Michael Schmidt', confidence: 0.89 }
          });
          window.dispatchEvent(event);
          
          toast({
            title: "Contact Identified",
            description: "Michael Schmidt identified with 89% confidence",
          });
        }
      }
    }
  }, [messages, callActive, toast]);
  
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
      
      // Simulate customer response after a short delay
      if (messages.length % 2 === 0 || messages.length === 0) {
        setTimeout(() => {
          let customerResponse = "";
          
          // Scenario-specific responses
          if (activeScenario === 'bankDetails') {
            const bankResponses = [
              "Yes, I'd like to change my bank from Deutsche Bank to Commerzbank.",
              "My new IBAN is DE89370400440532013001.",
              "Yes, that's correct. I recently switched banks.",
              "Thank you for updating my information."
            ];
            customerResponse = bankResponses[Math.min(Math.floor(messages.length / 2), bankResponses.length - 1)];
          } else if (activeScenario === 'verification') {
            const verificationResponses = [
              "Yes, that's right. My name is Michael Schmidt.",
              "I was born on March 15, 1985.",
              "My address is Hauptstrasse 123, Berlin.",
              "The last four digits of my account are 4321."
            ];
            customerResponse = verificationResponses[Math.min(Math.floor(messages.length / 2), verificationResponses.length - 1)];
          } else {
            // Default or account history responses
            const defaultResponses = [
              "I'd like to know about my recent transactions.",
              "Yes, specifically the last three months.",
              "I don't recognize a transaction from last week.",
              "It was a payment to Online Shop GmbH for €79.99.",
              "Thank you for your help."
            ];
            customerResponse = defaultResponses[Math.min(Math.floor(messages.length / 2), defaultResponses.length - 1)];
          }
          
          const customerMessage: Message = {
            id: messages.length + 2,
            text: customerResponse,
            sender: 'customer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages(prev => [...prev, customerMessage]);
        }, 1500);
      }
    }
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };
  
  const handleCall = () => {
    if (!callActive) {
      // Start call
      setCallActive(true);
      setCallStartTime(new Date());
      toast({
        title: "Incoming Call",
        description: "Call from +49 123 456 7890",
      });
      
      // Add initial agent greeting after a brief delay
      setTimeout(() => {
        const initialMessage: Message = {
          id: 1,
          text: "Hello, thank you for calling customer service. How can I help you today?",
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([initialMessage]);
      }, 1000);
    } else {
      // End call
      setCallActive(false);
      setCallStartTime(null);
      setElapsedTime('00:00');
      toast({
        title: "Call Ended",
        description: `Call duration: ${elapsedTime}`,
      });
    }
  };
  
  return (
    <Card className="rounded-lg flex flex-col h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Live Transcript</CardTitle>
        <div className="flex items-center gap-2">
          {callActive && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              {elapsedTime}
            </Badge>
          )}
          <Button 
            variant={callActive ? "destructive" : "default"} 
            size="sm" 
            onClick={handleCall}
            className="gap-1"
          >
            {callActive ? <PhoneOff size={16} /> : <PhoneCall size={16} />}
            {callActive ? "End Call" : "Simulate Call"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.length === 0 && !callActive ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <PhoneCall size={48} className="mx-auto mb-2 opacity-20" />
                <p>No active call</p>
                <p className="text-sm">Click "Simulate Call" to start</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={message.sender === 'agent' ? 'transcript-agent' : 'transcript-customer'}
                >
                  <div className="text-sm">{message.text}</div>
                  <div className="text-xs opacity-70 mt-1 text-right">{message.timestamp}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="border-t pt-4">
          {isRecording && (
            <div className="text-sm mb-2 text-callflow-danger flex items-center">
              <span className="recording-dot"></span>
              Recording...
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              size="icon" 
              variant={isRecording ? "destructive" : "outline"} 
              onClick={toggleRecording}
              disabled={!callActive}
            >
              <Mic size={18} />
            </Button>
            <Input 
              placeholder={callActive ? "Type your message..." : "Start a call to begin"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && callActive) {
                  handleSendMessage();
                }
              }}
              disabled={!callActive}
            />
            <Button 
              type="button" 
              size="icon" 
              onClick={handleSendMessage} 
              disabled={!callActive || !inputValue.trim()}
            >
              <CornerDownLeft size={18} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptPanel;
