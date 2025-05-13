
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  PhoneCall, 
  Users, 
  BarChart3, 
  ClipboardList, 
  Settings, 
  HelpCircle, 
  HeadphonesIcon,
  FileText,
  AlertCircle,
  User,
  Beaker,
  ChevronRight,
  Bell
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar
} from '@/components/ui/sidebar';
import SidebarTrigger from './SidebarTrigger';
import NotificationBadge from './notifications/NotificationBadge';
import { useNotifications } from '@/contexts/NotificationsContext';

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar = ({ collapsed = true }: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [isHovered, setIsHovered] = useState(false);
  const { setOpen } = useSidebar();
  const { unreadCount } = useNotifications();

  // Set sidebar state based on props and hover
  useEffect(() => {
    setOpen(!collapsed || isHovered);
  }, [collapsed, isHovered, setOpen]);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ShadcnSidebar 
        className="w-60 h-screen transition-all duration-300" 
        variant="sidebar" 
        collapsible="icon"
      >
        <SidebarContent className="flex flex-col h-full">
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Dashboard" isActive={isActive('/dashboard')} asChild>
                    <Link to="/dashboard">
                      <Home size={20} />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Test Scenario" isActive={isActive('/test-scenario')} asChild>
                    <Link to="/test-scenario">
                      <Beaker size={20} />
                      <span>Test Scenario</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Calls" isActive={isActive('/calls')} asChild>
                    <Link to="/calls">
                      <PhoneCall size={20} />
                      <span>Calls</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Contacts" isActive={isActive('/contacts')} asChild>
                    <Link to="/contacts">
                      <Users size={20} />
                      <span>Contacts</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Notifications" isActive={isActive('/notifications')} asChild>
                    <Link to="/notifications" className="relative">
                      {collapsed || !isHovered ? (
                        <NotificationBadge />
                      ) : (
                        <>
                          <Bell size={20} />
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Call Center</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Current Queue" isActive={isActive('/queue')} asChild>
                    <Link to="/queue">
                      <HeadphonesIcon size={20} />
                      <span>Queue</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Call History" isActive={isActive('/call-history')} asChild>
                    <Link to="/call-history">
                      <FileText size={20} />
                      <span>Call History</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Escalations" isActive={isActive('/escalations')} asChild>
                    <Link to="/escalations">
                      <AlertCircle size={20} />
                      <span>Escalations</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Analytics</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Reports" isActive={isActive('/reports')} asChild>
                    <Link to="/reports">
                      <ClipboardList size={20} />
                      <span>Reports</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Statistics" isActive={isActive('/stats')} asChild>
                    <Link to="/stats">
                      <BarChart3 size={20} />
                      <span>Statistics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />
          
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Profile" isActive={isActive('/profile')} asChild>
                    <Link to="/profile">
                      <User size={20} />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings" isActive={isActive('/settings')} asChild>
                    <Link to="/settings">
                      <Settings size={20} />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Help & Support" isActive={isActive('/help')} asChild>
                    <Link to="/help">
                      <HelpCircle size={20} />
                      <span>Help & Support</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ShadcnSidebar>

      {/* Sidebar expand trigger - only visible when collapsed */}
      {collapsed && !isHovered && (
        <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-50">
          <button 
            className="flex items-center justify-center w-6 h-12 bg-white rounded-r-md shadow-md border border-l-0 border-gray-200"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
