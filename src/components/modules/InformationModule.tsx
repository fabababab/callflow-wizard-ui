
import React, { useState } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ChevronDown, ChevronUp, Link } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InfoSection {
  title: string;
  items: { label: string; value: string }[];
}

const InformationModule: React.FC<ModuleProps> = ({ 
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}) => {
  const isInlineDisplay = data?.isInline === true;
  const message = data?.message || '';
  const sections = data?.sections || [];
  const note = data?.note || '';
  
  const handleAcknowledge = () => {
    if (onComplete) {
      onComplete({
        acknowledged: true,
        viewedSections: sections.map((section: InfoSection) => section.title)
      });
    }
    if (onClose) onClose();
  };
  
  const cardClassName = isInlineDisplay
    ? "w-full border-l-4 border-indigo-300 border-r border-t border-b border-indigo-200 shadow-sm rounded-md bg-indigo-50/60"
    : "w-full max-w-md border border-indigo-200 shadow-md";

  return (
    <Card className={cardClassName}>
      <CardHeader className={`${isInlineDisplay ? "bg-transparent py-2 pb-0" : "bg-indigo-50 border-b border-indigo-100"}`}>
        <div className="flex items-center gap-2">
          <Info className={`${isInlineDisplay ? "h-4 w-4" : "h-5 w-5"} text-indigo-600`} />
          <CardTitle className={`${isInlineDisplay ? "text-indigo-700 text-sm" : "text-indigo-900"}`}>
            {title || 'Information'}
          </CardTitle>
        </div>
        {message && (
          <CardDescription className={`text-xs ${isInlineDisplay ? "text-indigo-600/70" : ""}`}>
            {message}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className={`${isInlineDisplay ? "pt-2" : "pt-6"} space-y-4`}>
        {sections.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Keine Informationen verfügbar</p>
        ) : (
          sections.map((section: InfoSection, index: number) => (
            <div key={index} className="space-y-2">
              <h3 className={`font-medium ${isInlineDisplay ? "text-sm text-indigo-800" : "text-base"}`}>
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex} 
                    className="grid grid-cols-2 gap-2 text-sm border-b border-indigo-100/50 pb-1"
                  >
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <span className="text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        
        {note && (
          <div className="mt-2 bg-blue-50 border border-blue-100 rounded-md p-2">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-700">{note}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className={`flex justify-between ${isInlineDisplay ? "py-2 bg-transparent border-t border-indigo-100/50" : "bg-gray-50 border-t"}`}>
        <Button 
          variant="outline" 
          onClick={onClose}
          className={isInlineDisplay ? "text-xs" : ""}
        >
          Schließen
        </Button>
        <Button 
          onClick={handleAcknowledge}
          className={isInlineDisplay ? "text-xs bg-indigo-500 hover:bg-indigo-600 text-white" : ""}
        >
          Verstanden
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InformationModule;
