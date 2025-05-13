
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SidebarTrigger from '@/components/SidebarTrigger';
import { Bell, Settings, Home, Phone, FileText } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const navigate = useNavigate();
  const { notifications, addNotification, unreadCount } = useNotifications();
  const [showNotificationsModal, setShowNotificationsModal] = React.useState(false);
  
  return (
    <header className="border-b bg-background h-14 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold hidden md:block">Call Center Simulator</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <Home className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={() => navigate('/test-scenario')}>
          <Phone className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={() => navigate('/calls')}>
          <FileText className="h-5 w-5" />
        </Button>
        
        {/* Notification Bell */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setShowNotificationsModal(!showNotificationsModal)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
        
        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
