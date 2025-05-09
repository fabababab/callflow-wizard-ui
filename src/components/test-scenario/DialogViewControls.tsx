
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileJson, LayoutDashboard } from 'lucide-react';

interface DialogViewControlsProps {
  dialogViewMode: "json" | "visualization";
  handleViewModeToggle: (mode: "json" | "visualization") => void;
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
        JSON View
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
    </div>
  );
};

export default DialogViewControls;
