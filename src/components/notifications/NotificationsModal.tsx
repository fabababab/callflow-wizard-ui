import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Trash2,
  Clock,
  CheckCheck,
  Bell
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'error':
    case 'destructive':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Info className="h-5 w-5 text-gray-500" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'info':
      return 'bg-blue-50 border-blue-100';
    case 'success':
      return 'bg-green-50 border-green-100';
    case 'warning':
      return 'bg-amber-50 border-amber-100';
    case 'error':
    case 'destructive':
      return 'bg-red-50 border-red-100';
    default:
      return 'bg-gray-50 border-gray-100';
  }
};

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ open, onOpenChange }) => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll,
    unreadCount 
  } = useNotifications();
  
  const [activeTab, setActiveTab] = useState('all');

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <DialogTitle>Notifications</DialogTitle>
              <Badge variant="outline" className="ml-1">
                {notifications.length}
              </Badge>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs"
              >
                <Trash2 size={14} />
                Clear
              </Button>
            </div>
          </div>
          <DialogDescription className="mt-1">
            Recent system notifications and messages
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-2"
        >
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all" className="text-xs flex items-center gap-1">
              All
              <Badge variant="outline" className="ml-1 text-xs px-1.5">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs flex items-center gap-1">
              Unread
              {unreadCount > 0 && (
                <Badge variant="default" className="bg-blue-500 text-xs px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="info" className="text-xs flex items-center gap-1">
              <Info size={12} className="text-blue-500" />
              Info
            </TabsTrigger>
            <TabsTrigger value="success" className="text-xs flex items-center gap-1">
              <CheckCircle size={12} className="text-green-500" />
              Success
            </TabsTrigger>
            <TabsTrigger value="error" className="text-xs flex items-center gap-1">
              <AlertCircle size={12} className="text-red-500" />
              Error
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-3 max-h-[50vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No notifications found
                </div>
              ) : (
                filteredNotifications.slice(0, 10).map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border rounded-lg text-sm ${getTypeColor(notification.type)} ${!notification.read ? 'border-l-4' : ''}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <NotificationIcon type={notification.type} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock size={10} className="mr-1" />
                              <time title={format(notification.timestamp, 'PPpp')}>
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </time>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5" 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                            >
                              <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {filteredNotifications.length > 10 && (
                <div className="text-center py-2">
                  <span className="text-sm text-gray-500">Showing 10 of {filteredNotifications.length} notifications</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4 flex justify-between gap-4 sm:justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs"
            onClick={() => onOpenChange(false)}
            asChild
          >
            <Link to="/notifications">View all notifications</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal; 