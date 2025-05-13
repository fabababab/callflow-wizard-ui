
import React, { useState } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ChevronDown, ChevronUp, Link } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InfoBlock {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'default';
  hasDetails?: boolean;
  detailsContent?: string;
  link?: string;
  linkText?: string;
}

const InformationModule: React.FC<ModuleProps> = ({ 
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}) => {
  const infoBlocks = data?.blocks || [];
  const [expandedBlocks, setExpandedBlocks] = useState<string[]>([]);
  const isInlineDisplay = data?.isInline === true;
  
  const toggleBlockExpansion = (blockId: string) => {
    setExpandedBlocks(prev => 
      prev.includes(blockId) 
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    );
  };
  
  const handleAcknowledge = () => {
    if (onComplete) {
      onComplete({
        acknowledged: true,
        viewedBlocks: infoBlocks.map((block: InfoBlock) => block.id)
      });
    }
    if (onClose) onClose();
  };
  
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'info':
        return { 
          bg: 'bg-blue-50', 
          border: 'border-blue-100', 
          text: 'text-blue-800',
          icon: <Info className="h-5 w-5 text-blue-600" />
        };
      case 'warning':
        return { 
          bg: 'bg-yellow-50', 
          border: 'border-yellow-100', 
          text: 'text-yellow-800',
          icon: <Info className="h-5 w-5 text-yellow-600" />
        };
      case 'success':
        return { 
          bg: 'bg-green-50', 
          border: 'border-green-100', 
          text: 'text-green-800',
          icon: <Info className="h-5 w-5 text-green-600" />
        };
      case 'error':
        return { 
          bg: 'bg-red-50', 
          border: 'border-red-100', 
          text: 'text-red-800',
          icon: <Info className="h-5 w-5 text-red-600" />
        };
      default:
        return { 
          bg: 'bg-gray-50', 
          border: 'border-gray-100', 
          text: 'text-gray-800',
          icon: <Info className="h-5 w-5 text-gray-600" />
        };
    }
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
            {title || 'Important Information'}
          </CardTitle>
        </div>
        <CardDescription className={`text-xs ${isInlineDisplay ? "text-indigo-600/70" : ""}`}>
          Please review the following information
        </CardDescription>
      </CardHeader>
      
      <CardContent className={`${isInlineDisplay ? "pt-2" : "pt-6"} space-y-4`}>
        {infoBlocks.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No information available</p>
        ) : (
          infoBlocks.map((block: InfoBlock) => {
            const styles = getTypeStyles(block.type);
            const isExpanded = expandedBlocks.includes(block.id);
            
            return (
              <div 
                key={block.id} 
                className={`border rounded-md overflow-hidden ${styles.border}`}
              >
                <div className={`p-3 ${styles.bg}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {styles.icon}
                      <h3 className={`font-medium ${styles.text} ${isInlineDisplay ? "text-sm" : ""}`}>
                        {block.title}
                      </h3>
                    </div>
                    
                    {block.hasDetails && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={styles.text}
                        onClick={() => toggleBlockExpansion(block.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <p className={`mt-1 text-sm ${styles.text}`}>{block.content}</p>
                  
                  {block.link && (
                    <a 
                      href={block.link}
                      className="mt-2 text-sm flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Link className="h-3 w-3" />
                      {block.linkText || 'Learn more'}
                    </a>
                  )}
                </div>
                
                {block.hasDetails && isExpanded && block.detailsContent && (
                  <div className="p-3 border-t bg-white">
                    <p className="text-sm text-gray-700">{block.detailsContent}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
      
      <CardFooter className={`flex justify-between ${isInlineDisplay ? "py-2 bg-transparent border-t border-indigo-100/50" : "bg-gray-50 border-t"}`}>
        <Button 
          variant="outline" 
          onClick={onClose}
          className={isInlineDisplay ? "text-xs" : ""}
        >
          Close
        </Button>
        <Button 
          onClick={handleAcknowledge}
          className={isInlineDisplay ? "text-xs bg-indigo-500 hover:bg-indigo-600 text-white" : ""}
        >
          I Understand
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InformationModule;
