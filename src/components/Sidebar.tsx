
import React from 'react';
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
  User
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator
} from '@/components/ui/sidebar';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <ShadcnSidebar className="w-60 h-[calc(100vh-4rem)]" variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Dashboard" isActive={isActive('/')}>
                  <Home size={20} />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Calls" isActive={isActive('/calls')}>
                  <PhoneCall size={20} />
                  <span>Calls</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Contacts" isActive={isActive('/contacts')}>
                  <Users size={20} />
                  <span>Contacts</span>
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
                <SidebarMenuButton tooltip="Current Queue" isActive={isActive('/queue')}>
                  <HeadphonesIcon size={20} />
                  <span>Queue</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Call History" isActive={isActive('/history')}>
                  <FileText size={20} />
                  <span>Call History</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Escalations" isActive={isActive('/escalations')}>
                  <AlertCircle size={20} />
                  <span>Escalations</span>
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
                <SidebarMenuButton tooltip="Reports" isActive={isActive('/reports')}>
                  <ClipboardList size={20} />
                  <span>Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Statistics" isActive={isActive('/stats')}>
                  <BarChart3 size={20} />
                  <span>Statistics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />
      
      <SidebarContent className="mt-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Profile" isActive={isActive('/profile')}>
                  <User size={20} />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" isActive={isActive('/settings')}>
                  <Settings size={20} />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Help & Support" isActive={isActive('/help')}>
                  <HelpCircle size={20} />
                  <span>Help & Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
};

export default Sidebar;
