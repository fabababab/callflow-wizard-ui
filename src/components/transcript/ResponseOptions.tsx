
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ResponseOptionsProps {
  options: string[];
  onSelectResponse: (response: string) => void;
}

const ResponseOptions: React.FC<ResponseOptionsProps> = ({ options, onSelectResponse }) => {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-2 border-t border-gray-300/20">
      <div className="text-xs font-medium mb-2">Antwortoptionen:</div>
      <div className="space-y-1.5">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onSelectResponse(option)}
            className="w-full px-3 py-2 text-left text-sm bg-primary/10 hover:bg-primary/20 rounded-md transition-colors duration-200 flex items-center gap-2 group"
            type="button"
            aria-label={`Select response: ${option}`}
          >
            <span className="flex-1 whitespace-normal break-words">{option}</span>
            <ChevronRight className="h-3 w-3 ml-auto opacity-70 group-hover:opacity-90" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ResponseOptions;
