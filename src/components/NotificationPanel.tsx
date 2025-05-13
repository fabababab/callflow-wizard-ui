
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bell, Trash2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ToastProps } from '@/components/ui/toast';
import { ScrollArea } from '@/components/ui/scroll-area';

type NotificationPanelProps = {
  className?: string;
}

const NotificationPanel = ({ className }: NotificationPanelProps) => {
  const { notifications, unreadCount, markAsRead, clearAll, dismiss } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      markAsRead("all");
    }
  };

  const handleDeleteNotification = (id: string) => {
    dismiss(id);
  };

  const handleClearAll = () => {
    clearAll();
  };

  const renderNotificationIcon = (variant?: ToastProps['variant']) => {
    switch (variant) {
      case 'destructive':
        return <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600"><X size={16} /></div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Check size={16} /></div>;
    }
  };

  return (
    <Sheet onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={`text-callflow-text relative ${className}`}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500" 
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[400px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <div className="flex justify-between items-center">
              <SheetTitle>Notifications</SheetTitle>
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8">
                <Trash2 size={16} className="mr-2" />
                Clear All
              </Button>
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-0">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Bell size={24} className="mb-2" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="p-0">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`border-b p-4 ${notification.read ? 'bg-background' : 'bg-muted/20'}`}
                  >
                    <div className="flex gap-3">
                      {renderNotificationIcon(notification.variant)}
                      <div className="flex-1">
                        {notification.title && (
                          <div className="font-medium">{notification.title}</div>
                        )}
                        {notification.description && (
                          <div className="text-sm text-muted-foreground">{notification.description}</div>
                        )}
                        {notification.timestamp && (
                          <div className="text-xs text-muted-foreground mt-1">{notification.timestamp}</div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="p-4 border-t">
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationPanel;
