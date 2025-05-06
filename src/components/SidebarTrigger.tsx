
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

interface SidebarTriggerProps {
  className?: string;
}

const SidebarTrigger = ({ className }: SidebarTriggerProps) => {
  // Safely try to use sidebar context, providing fallback values if not in a SidebarProvider
  let sidebarState;
  let toggleSidebar;
  
  try {
    const sidebarContext = useSidebar();
    sidebarState = sidebarContext.state;
    toggleSidebar = sidebarContext.toggleSidebar;
  } catch (error) {
    // Fallback if not in SidebarProvider
    sidebarState = "collapsed";
    toggleSidebar = () => console.warn("SidebarTrigger used outside of SidebarProvider");
  }
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className={`h-10 w-10 rounded-full border-2 border-gray-300 bg-white text-muted-foreground hover:bg-background hover:text-foreground hover:border-gray-400 transition-all shadow-md ${className}`}
      onClick={toggleSidebar}
      aria-label={sidebarState === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
    >
      {sidebarState === "expanded" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </Button>
  );
};

export default SidebarTrigger;
