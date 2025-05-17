
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MessageResponseOptionsProps {
  responseOptions: string[];
  onSelectResponse: (response: string) => void;
}

const MessageResponseOptions: React.FC<MessageResponseOptionsProps> = ({ 
  responseOptions,
  onSelectResponse
}) => {
  if (!responseOptions || responseOptions.length === 0) return null;

  const handleSelectResponse = (response: string) => {
    console.log(`Selecting response: ${response}`);
    onSelectResponse(response);
  };

  return (
    <div className="mt-3 pt-2 border-t border-gray-300/20">
      <div className="text-xs font-medium mb-2">Verfügbare Antworten:</div>
      <div className="space-y-1.5">
        {responseOptions.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectResponse(option)}
            className="w-full px-3 py-2 text-left text-sm bg-primary/10 hover:bg-primary/20 rounded-md transition-colors duration-200 flex items-center gap-2 group"
          >
            <span className="flex-1 whitespace-normal break-words">{option}</span>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-90 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessageResponseOptions;
