
import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Trash2,
  Clock,
  CheckCheck
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

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

const Notifications = () => {
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
    <div className="container mx-auto py-6 max-w-4xl">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">Notifications</CardTitle>
              <CardDescription>View all system notifications and messages</CardDescription>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1"
                >
                  <CheckCheck size={16} />
                  Mark all as read
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                className="flex items-center gap-1 text-red-500 hover:text-red-600"
              >
                <Trash2 size={16} />
                Clear all
              </Button>
            </div>
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mt-4"
          >
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All
                <Badge variant="outline" className="ml-1">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="default" className="bg-blue-500">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Info size={16} className="text-blue-500" />
                Info
              </TabsTrigger>
              <TabsTrigger value="success" className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Success
              </TabsTrigger>
              <TabsTrigger value="error" className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                Error
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No notifications found
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border rounded-lg ${getTypeColor(notification.type)} ${!notification.read ? 'border-l-4' : ''}`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <NotificationIcon type={notification.type} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock size={12} className="mr-1" />
                                <time title={format(notification.timestamp, 'PPpp')}>
                                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                </time>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => removeNotification(notification.id)}
                              >
                                <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">{notification.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
