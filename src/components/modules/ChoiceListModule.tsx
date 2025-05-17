
import React, { useState } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Option {
  id: string;
  label: string;
}

const ChoiceListModule: React.FC<ModuleProps> = ({ 
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const options = data?.options || [];
  const description = data?.description || 'Please select an option from the list below';
  const buttonText = data?.buttonText || 'Confirm';
  const isInlineDisplay = data?.isInline === true;
  
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };
  
  const handleSubmit = () => {
    if (!selectedOption) {
      toast({
        title: "No selection",
        description: "Please select an option before continuing.",
        duration: 2000
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Find the selected option object
    const selectedOptionObject = options.find((option: Option) => option.id === selectedOption);
    
    console.log(`ChoiceListModule: selected option ${selectedOption}`, selectedOptionObject);
    
    // Complete with the selected option
    setTimeout(() => {
      onComplete({
        selectedOptionId: selectedOption,
        selectedOption: selectedOptionObject
      });
      setIsSubmitting(false);
    }, 500);
  };
  
  // Use different styling for inline vs modal display
  const cardClassName = isInlineDisplay
    ? "w-full border border-amber-200 shadow-sm rounded-md bg-amber-50/60"
    : "w-full max-w-md border border-amber-200 shadow-md";
  
  return (
    <Card className={cardClassName} data-testid={`choice-list-module-${id}`}>
      <CardHeader className={`${isInlineDisplay ? "pb-2" : "pb-4"}`}>
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-amber-900">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {options.map((option: Option) => (
          <div
            key={option.id}
            className={`
              p-3 rounded-md border cursor-pointer transition-all
              ${selectedOption === option.id 
                ? 'bg-amber-100 border-amber-300' 
                : 'bg-white border-gray-200 hover:bg-amber-50 hover:border-amber-200'}
            `}
            onClick={() => handleOptionSelect(option.id)}
          >
            <div className="flex items-center justify-between">
              <span>{option.label}</span>
              {selectedOption === option.id && <Check size={18} className="text-amber-500" />}
            </div>
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2 pt-2">
        {!isInlineDisplay && (
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting}
          className={isInlineDisplay ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChoiceListModule;
