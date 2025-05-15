
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CollapsibleDetailsProps {
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const CollapsibleDetails: React.FC<CollapsibleDetailsProps> = ({ 
  label, 
  open, 
  onOpenChange, 
  children 
}) => {
  return (
    <Collapsible 
      open={open} 
      onOpenChange={onOpenChange}
      className="border-t border-amber-200"
    >
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full flex items-center justify-between p-2 h-auto text-xs text-amber-700 hover:bg-amber-100/50"
        >
          <span>{label}</span>
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-2 bg-white/50">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleDetails;
