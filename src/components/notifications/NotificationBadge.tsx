
import React from 'react';
import { BellIcon } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationsContext";
import { Badge } from "@/components/ui/badge";

interface NotificationBadgeProps {
  className?: string;
}

const NotificationBadge = ({ className }: NotificationBadgeProps) => {
  const { unreadCount } = useNotifications();
  
  return (
    <div className={`relative ${className}`}>
      <BellIcon size={20} />
      {unreadCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full p-0.5">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </div>
  );
};

export default NotificationBadge;
