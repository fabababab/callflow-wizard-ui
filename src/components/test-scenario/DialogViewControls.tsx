
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileJson, LayoutDashboard, Puzzle } from 'lucide-react';

interface DialogViewControlsProps {
  dialogViewMode: "json" | "visualization" | "modules";
  handleViewModeToggle: (mode: "json" | "visualization" | "modules") => void;
}

const DialogViewControls: React.FC<DialogViewControlsProps> = ({
  dialogViewMode,
  handleViewModeToggle
}) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-4">
      <Button 
        variant={dialogViewMode === "json" ? "secondary" : "outline"} 
        size="sm" 
        onClick={() => handleViewModeToggle("json")} 
        className="flex items-center gap-2"
      >
        <FileJson size={16} />
        JSON File
      </Button>
      <Button 
        variant={dialogViewMode === "visualization" ? "secondary" : "outline"} 
        size="sm" 
        onClick={() => handleViewModeToggle("visualization")} 
        className="flex items-center gap-2"
      >
        <LayoutDashboard size={16} />
        Visualization
      </Button>
      <Button 
        variant={dialogViewMode === "modules" ? "secondary" : "outline"} 
        size="sm" 
        onClick={() => handleViewModeToggle("modules")} 
        className="flex items-center gap-2"
      >
        <Puzzle size={16} />
        Modules
      </Button>
    </div>
  );
};

export default DialogViewControls;
