
import React from 'react';
import { Button } from '@/components/ui/button';
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
      <div className="text-xs font-medium mb-2">Response Options:</div>
      <div className="space-y-1">
        {options.map((option, idx) => (
          <Button
            key={idx}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => onSelectResponse(option)}
          >
            <span className="truncate">{option}</span>
            <ChevronRight className="h-3 w-3 ml-auto" />
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ResponseOptions;
