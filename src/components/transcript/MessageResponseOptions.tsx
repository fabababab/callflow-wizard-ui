
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MessageResponseOptionsProps {
  responseOptions: string[];
  onSelectResponse: (response: string) => void;
  usedOptions?: Set<string>;
  isFromProcessedState?: boolean;
}

const MessageResponseOptions: React.FC<MessageResponseOptionsProps> = ({ 
  responseOptions,
  onSelectResponse,
  usedOptions = new Set(),
  isFromProcessedState = false
}) => {
  if (!responseOptions || responseOptions.length === 0) return null;

  const handleSelectResponse = (response: string) => {
    // Only process the click if the option hasn't been used and the state hasn't been processed
    if (!usedOptions.has(response) && !isFromProcessedState) {
      console.log(`Selecting response: ${response}`);
      onSelectResponse(response);
    } else {
      console.log(`Ignoring response selection - option "${response}" has already been used or state is processed`);
    }
  };

  return (
    <div className="mt-3 pt-2 border-t border-gray-300/20">
      <div className="text-xs font-medium mb-2">Verfügbare Antworten:</div>
      <div className="space-y-1.5">
        {responseOptions.map((option, idx) => {
          const isUsed = usedOptions.has(option);
          const isDisabled = isUsed || isFromProcessedState;
          
          return (
            <button
              key={idx}
              onClick={() => handleSelectResponse(option)}
              disabled={isDisabled}
              className={`w-full px-3 py-2 text-left text-sm rounded-md transition-colors duration-200 flex items-center gap-2 group
                ${isDisabled 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70' 
                  : 'bg-primary/10 hover:bg-primary/20'}`}
            >
              <span className="flex-1 whitespace-normal break-words">
                {option}
                {isUsed && <span className="ml-2 text-xs text-gray-400">(bereits verwendet)</span>}
              </span>
              {!isDisabled && <ChevronRight className="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-90 transition-opacity" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MessageResponseOptions;
