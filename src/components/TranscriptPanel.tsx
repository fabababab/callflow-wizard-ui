
import React, { useRef, useEffect } from 'react';
import { Mic, CornerDownLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Message = {
  id: number;
  text: string;
  sender: 'agent' | 'customer';
  timestamp: string;
};

const TranscriptPanel = () => {
  const [messages, setMessages] = React.useState<Message[]>([
    { id: 1, text: "Hello, thank you for calling customer service. How can I help you today?", sender: "agent", timestamp: "14:32" },
    { id: 2, text: "Hi, I'd like to update my bank details for my account.", sender: "customer", timestamp: "14:32" },
    { id: 3, text: "I'd be happy to help you with that. First, I'll need to verify your identity for security purposes.", sender: "agent", timestamp: "14:33" },
    { id: 4, text: "Of course, what information do you need?", sender: "customer", timestamp: "14:33" },
    { id: 5, text: "Could you please confirm your full name and date of birth?", sender: "agent", timestamp: "14:34" },
    { id: 6, text: "My name is Michael Schmidt, and I was born on March 15, 1985.", sender: "customer", timestamp: "14:34" },
  ]);
  
  const [inputValue, setInputValue] = React.useState('');
  const [isRecording, setIsRecording] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'agent' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
      
      // Simulate customer response after a short delay
      if (messages.length % 2 === 0) {
        setTimeout(() => {
          const customerResponses = [
            "Thanks for confirming that information.",
            "Ok, I understand. What's the next step?",
            "Is there anything else you need from me?",
            "Could you please explain that in more detail?",
            "I appreciate your help today."
          ];
          
          const randomResponse = customerResponses[Math.floor(Math.random() * customerResponses.length)];
          
          const customerMessage = {
            id: messages.length + 2,
            text: randomResponse,
            sender: 'customer' as const,
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
  
  return (
    <Card className="rounded-lg flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Live Transcript</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
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
            >
              <Mic size={18} />
            </Button>
            <Input 
              placeholder="Type your message..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button type="button" size="icon" onClick={handleSendMessage}>
              <CornerDownLeft size={18} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptPanel;
