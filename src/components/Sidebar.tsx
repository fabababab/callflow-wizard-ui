
import React from 'react';
import { Home, PhoneCall, Users, BarChart3, ClipboardList, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavItemProps = {
  icon: React.ElementType;
  label: string;
  active?: boolean;
};

const NavItem = ({ icon: Icon, label, active }: NavItemProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 px-3",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Button>
  );
};

const Sidebar = () => {
  return (
    <div className="w-60 bg-sidebar h-[calc(100vh-4rem)] flex flex-col border-r">
      <div className="flex-1 py-4 px-3 space-y-1">
        <NavItem icon={Home} label="Dashboard" />
        <NavItem icon={PhoneCall} label="Calls" active />
        <NavItem icon={Users} label="Contacts" />
        <NavItem icon={BarChart3} label="Analytics" />
        <NavItem icon={ClipboardList} label="Reports" />
      </div>
      
      <div className="py-4 px-3 border-t border-sidebar-border space-y-1">
        <NavItem icon={Settings} label="Settings" />
        <NavItem icon={HelpCircle} label="Help & Support" />
      </div>
    </div>
  );
};

export default Sidebar;
