
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { Home, Phone, Users, Clock, ChevronLeft, BarChart2, ListChecks, AlarmClock, FileText, HelpCircle, Settings, User, Menu } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

// Create a hook to check if we're on mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(
    window.innerWidth < 768
  );

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar();
  const isMobile = useIsMobile();
  
  // In mobile view, sidebar should be controlled by the context
  const effectiveCollapsed = isMobile ? !sidebarOpen : collapsed;
  
  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <aside 
      className={cn(
        "bg-sidebar border-r transition-all duration-300 h-screen z-10",
        effectiveCollapsed ? "w-[70px]" : "w-[240px]",
        isMobile && !sidebarOpen && "w-0 border-r-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Mobile menu trigger */}
        {isMobile && (
          <div className="p-4 flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu />
            </Button>
          </div>
        )}
        
        {/* Logo area */}
        <div className={cn(
          "flex items-center px-4 h-14",
          effectiveCollapsed && "justify-center"
        )}>
          {!effectiveCollapsed && <h1 className="text-xl font-semibold">Call Center</h1>}
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            <NavItem icon={<Home />} to="/dashboard" label="Dashboard" collapsed={effectiveCollapsed} />
            <NavItem icon={<Phone />} to="/test-scenario" label="Test Scenario" collapsed={effectiveCollapsed} />
            <NavItem icon={<Phone />} to="/calls" label="Calls" collapsed={effectiveCollapsed} />
            <NavItem icon={<Users />} to="/contacts" label="Contacts" collapsed={effectiveCollapsed} />
            <NavItem icon={<AlarmClock />} to="/queue" label="Queue" collapsed={effectiveCollapsed} />
            <NavItem icon={<Clock />} to="/call-history" label="Call History" collapsed={effectiveCollapsed} />
            <NavItem icon={<BarChart2 />} to="/reports" label="Reports" collapsed={effectiveCollapsed} />
            <NavItem icon={<BarChart2 />} to="/stats" label="Statistics" collapsed={effectiveCollapsed} />
            <NavItem icon={<ListChecks />} to="/escalations" label="Escalations" collapsed={effectiveCollapsed} />
          </ul>
        </nav>
        
        {/* Bottom actions */}
        <div className="mt-auto py-4 border-t">
          <ul className="space-y-1 px-2">
            <NavItem icon={<User />} to="/profile" label="Profile" collapsed={effectiveCollapsed} />
            <NavItem icon={<Settings />} to="/settings" label="Settings" collapsed={effectiveCollapsed} />
            <NavItem icon={<HelpCircle />} to="/help" label="Help" collapsed={effectiveCollapsed} />
          </ul>
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  to: string;
  label: string;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, to, label, collapsed }) => {
  return (
    <li>
      <NavLink 
        to={to} 
        className={({ isActive }) => cn(
          "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
          isActive 
            ? "bg-primary/10 text-primary" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          collapsed && "justify-center"
        )}
      >
        <span className="flex-shrink-0">{icon}</span>
        {!collapsed && <span className="ml-3">{label}</span>}
      </NavLink>
    </li>
  );
};

export default Sidebar;
