
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
  isBlocked: boolean;
  isAgentMode: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputValue,
  setInputValue,
  handleSendMessage,
  isBlocked,
  isAgentMode,
}) => {
  return (
    <div className="py-2 border-t">
      <div className="flex gap-2">
        <Input 
          placeholder={`Type your own ${isAgentMode ? 'agent' : 'customer'} response...`} 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button 
          type="submit" 
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isBlocked}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
