
import React, { useState, useEffect } from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';
import { ModuleConfig, ModuleType } from '@/types/modules';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import InlineModuleDisplay from '@/components/transcript/InlineModuleDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ModulesPreviewProps {
  loadedStateMachine: StateMachine | null;
}

const ModulesPreview: React.FC<ModulesPreviewProps> = ({ loadedStateMachine }) => {
  const [modules, setModules] = useState<ModuleConfig[]>([]);
  const [selectedModule, setSelectedModule] = useState<number>(0);

  useEffect(() => {
    // Extract all modules from the state machine
    if (loadedStateMachine) {
      const extractedModules: ModuleConfig[] = [];
      
      // Loop through all states in the state machine
      Object.entries(loadedStateMachine.states).forEach(([stateId, state]) => {
        // Check if the state has a module in meta
        if (state.meta?.module) {
          const moduleConfig = state.meta.module as ModuleConfig;
          extractedModules.push({
            ...moduleConfig,
            sourceState: stateId, // Add state info to know where module is from
            data: {
              ...moduleConfig.data,
              isInline: true // Force inline mode for preview
            }
          });
        }
      });
      
      if (extractedModules.length > 0) {
        setModules(extractedModules);
        setSelectedModule(0);
        toast({
          title: `${extractedModules.length} modules found`,
          description: "You can now preview all interactive modules in this scenario",
          duration: 3000
        });
      } else {
        toast({
          title: "No modules found",
          description: "This scenario doesn't contain any interactive modules",
          duration: 3000
        });
      }
    }
  }, [loadedStateMachine]);

  const handleModuleComplete = (result: any) => {
    console.log("Module interaction completed:", result);
  };

  const handleModuleChange = (value: string) => {
    const index = parseInt(value);
    setSelectedModule(index);
  };

  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg">
        <p className="text-muted-foreground text-center">
          No modules found in this state machine. Modules are interactive elements that can be displayed inline in the conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">
            Interactive Module {selectedModule + 1} of {modules.length}
          </h3>
          <p className="text-sm text-muted-foreground">
            From state: <Badge variant="outline">{modules[selectedModule]?.sourceState || "unknown"}</Badge>
          </p>
        </div>
      </div>

      <div className="border rounded-lg bg-white p-4 shadow-sm">
        <h4 className="font-medium text-sm mb-2">
          {modules[selectedModule]?.title} 
          <Badge className="ml-2" variant="secondary">
            {modules[selectedModule]?.type}
          </Badge>
        </h4>

        <div className="min-h-[300px]">
          <ScrollArea className="max-h-[500px]">
            <InlineModuleDisplay
              moduleConfig={modules[selectedModule]}
              onComplete={handleModuleComplete}
            />
          </ScrollArea>
        </div>
      </div>

      {modules.length > 1 && (
        <div className="py-2">
          <Select
            value={selectedModule.toString()}
            onValueChange={handleModuleChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a module" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module, index) => (
                <SelectItem key={module.id} value={index.toString()}>
                  {module.title || `Module ${index + 1}`} ({module.sourceState})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default ModulesPreview;
