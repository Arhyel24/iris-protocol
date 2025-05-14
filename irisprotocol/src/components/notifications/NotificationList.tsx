
import React from "react";
import NotificationItem from "./NotificationItem";

interface NotificationListProps {
  notifications: any[];
  loading: boolean;
  onItemClick: (notification: any) => void;
  getNotificationIcon: (type: string) => string;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  loading, 
  onItemClick,
  getNotificationIcon 
}) => {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start space-x-3 animate-pulse">
            <div className="w-8 h-8 bg-iris-purple/20 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-iris-purple/20 rounded w-4/5"></div>
              <div className="h-2 bg-iris-purple/10 rounded w-3/5"></div>
            </div>
          </div>
        ))}
      </div>
    );
  } 
  
  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>No notifications yet</p>
      </div>
    );
  }
  
  return (
    <div>
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id} 
          notification={notification}
          onClick={onItemClick}
          getNotificationIcon={getNotificationIcon}
        />
      ))}
    </div>
  );
};

export default NotificationList;
