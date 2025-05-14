
import React from "react";
import { format } from "date-fns";

interface NotificationItemProps {
  notification: any;
  onClick: (notification: any) => void;
  getNotificationIcon: (type: string) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick, getNotificationIcon }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      if (date.toDateString() === now.toDateString()) {
        return format(date, 'h:mm a'); // Today at 2:30 PM
      } else {
        return format(date, 'MMM d'); // Mar 15
      }
    } catch (e) {
      return "Unknown";
    }
  };

  return (
    <div 
      onClick={() => onClick(notification)}
      className={`p-3 hover:bg-iris-purple/5 cursor-pointer transition-colors border-b border-iris-purple/5 ${
        !notification.read ? 'bg-iris-purple/10' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="text-xl">{getNotificationIcon(notification.type)}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
              {notification.title}
            </p>
            <span className="text-xs text-gray-400">{formatDate(notification.created_at)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{notification.message}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
