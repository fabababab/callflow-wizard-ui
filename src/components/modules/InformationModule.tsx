
import React, { useState, memo } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ArrowRight, Download, BookOpen, List, FileText } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/hooks/use-toast';

const InformationModule: React.FC<ModuleProps> = memo(({ 
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}) => {
  const [expanded, setExpanded] = useState(false);
  const isInlineDisplay = data?.isInline === true;
  const { toast } = useToast();
  
  // Handle module completion
  const handleComplete = () => {
    console.log(`InformationModule ${id} completed`);
    onComplete({ 
      acknowledged: true,
      timestamp: new Date().toISOString()
    });
    
    toast({
      title: "Information Reviewed",
      description: "You've successfully reviewed the information",
      duration: 2000
    });
  };
  
  // Get the type of information being displayed
  const infoType = data?.infoType || 'general';
  
  // Determine which icon to show based on infoType
  const getInfoIcon = () => {
    switch(infoType) {
      case 'document':
        return <FileText className={`${isInlineDisplay ? "h-4 w-4" : "h-5 w-5"} text-amber-500`} />;
      case 'overview':
        return <List className={`${isInlineDisplay ? "h-4 w-4" : "h-5 w-5"} text-amber-500`} />;
      case 'policy':
        return <BookOpen className={`${isInlineDisplay ? "h-4 w-4" : "h-5 w-5"} text-amber-500`} />;
      default:
        return <Info className={`${isInlineDisplay ? "h-4 w-4" : "h-5 w-5"} text-amber-500`} />;
    }
  };
  
  // Generate content based on infoType
  const getInfoContent = () => {
    switch(infoType) {
      case 'document':
        return (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-md">
              <h3 className="text-sm font-medium mb-2 text-amber-800">Versicherungspolice - Document Structure</h3>
              <ul className="text-xs space-y-2 text-amber-700">
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Policy Details</strong>: Basic information about your insurance policy including policy number and effective dates
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Coverage Summary</strong>: Overview of what is covered under your policy
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Premium Information</strong>: Details about your premium amount and payment schedule
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Terms & Conditions</strong>: Important policy terms and conditions
                  </span>
                </li>
              </ul>
            </div>
            <div className="flex justify-end">
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs flex items-center gap-1"
                onClick={() => toast({
                  title: "Document Downloaded",
                  description: "The document was downloaded successfully",
                  duration: 2000
                })}
              >
                <Download className="h-3 w-3" />
                Download Document
              </Button>
            </div>
          </div>
        );
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-md">
              <h3 className="text-sm font-medium mb-2 text-amber-800">Insurance Package Overview</h3>
              <ul className="text-xs space-y-2 text-amber-700">
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Basic Coverage</strong>: Health insurance with standard coverage for medical visits and emergencies
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Additional Benefits</strong>: Coverage for physiotherapy, dental, and vision care
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Premium</strong>: €149,50 per month with annual adjustment based on usage
                  </span>
                </li>
              </ul>
            </div>
            {expanded && (
              <div className="p-3 bg-amber-50/30 border border-amber-100 rounded-md mt-2">
                <h4 className="text-sm font-medium mb-1 text-amber-800">Detailed Benefits</h4>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-amber-100/50">
                      <th className="p-1 text-left border border-amber-200">Benefit</th>
                      <th className="p-1 text-left border border-amber-200">Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border border-amber-200">Doctor Visits</td>
                      <td className="p-1 border border-amber-200">100%</td>
                    </tr>
                    <tr>
                      <td className="p-1 border border-amber-200">Hospital Stays</td>
                      <td className="p-1 border border-amber-200">100%</td>
                    </tr>
                    <tr>
                      <td className="p-1 border border-amber-200">Prescription Drugs</td>
                      <td className="p-1 border border-amber-200">80%</td>
                    </tr>
                    <tr>
                      <td className="p-1 border border-amber-200">Dental Care</td>
                      <td className="p-1 border border-amber-200">70% up to €1000/year</td>
                    </tr>
                    <tr>
                      <td className="p-1 border border-amber-200">Vision Care</td>
                      <td className="p-1 border border-amber-200">€200 every 2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-between">
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Show Less' : 'Show More Details'}
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                className="text-xs"
                onClick={() => handleComplete()}
              >
                Acknowledge
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-3">
            <p className="text-sm text-amber-700">
              {data?.content || "Please review this important information about your insurance coverage."}
            </p>
            <Button 
              size="sm" 
              variant="secondary"
              className="text-xs"
              onClick={() => handleComplete()}
            >
              Acknowledge
            </Button>
          </div>
        );
    }
  };
  
  // Card styling with yellowish theme
  const cardClassName = isInlineDisplay
    ? "w-full ml-auto border-l-4 border-amber-300 border-r border-t border-b border-amber-200 shadow-sm rounded-md bg-amber-50/60 transition-all duration-300"
    : "w-full max-w-md border border-amber-200 shadow-md transition-all duration-300";
  
  return (
    <Card className={cardClassName} data-testid={`information-module-${id}`}>
      <CardHeader className={`${isInlineDisplay ? "bg-transparent py-2 pb-0" : "bg-amber-50 border-b border-amber-100 py-3"}`}>
        <div className="flex items-center gap-2">
          {getInfoIcon()}
          <CardTitle className={`${isInlineDisplay ? "text-amber-700 text-sm" : "text-amber-900 text-base"}`}>
            {title || 'Important Information'}
          </CardTitle>
        </div>
        <CardDescription className={`text-xs ${isInlineDisplay ? "text-amber-600/70" : ""}`}>
          {data?.description || "Please review this information carefully"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className={`${isInlineDisplay ? "pt-2" : "pt-4"}`}>
        {getInfoContent()}
      </CardContent>
      
      {!isInlineDisplay && (
        <CardFooter className="bg-gray-50 border-t py-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Close
          </Button>
        </CardFooter>
      )}
    </Card>
  );
});

InformationModule.displayName = 'InformationModule';

export default InformationModule;
