
import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationsContext';

const NotificationBadge = () => {
  const { unreadCount } = useNotifications();
  
  return (
    <div className="relative inline-flex">
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex justify-center items-center w-4 h-4 text-[10px] font-medium text-white bg-red-500 rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBadge;
