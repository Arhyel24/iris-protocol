
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, AlertCircle, Check, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
  action_url?: string;
}

interface RecentNotificationsProps {
  notifications: Notification[];
  loading: boolean;
}

const RecentNotifications: React.FC<RecentNotificationsProps> = ({ notifications, loading }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'claimSubmitted':
      case 'claimUpdate':
      case 'claim':
        return <AlertCircle className="h-4 w-4 text-iris-yellow" />;
      case 'insurancePurchase':
      case 'insuranceUpgrade':
      case 'insuranceCancel':
      case 'insurance':
        return <Info className="h-4 w-4 text-iris-blue-light" />;
      case 'protectionDisabled':
      case 'protectionEnabled':
        return <Check className="h-4 w-4 text-iris-purple-light" />;
      default:
        return <Bell className="h-4 w-4 text-iris-purple" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <Card className="glass-card border-none shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          <Bell className="mr-2 h-5 w-5 text-iris-purple" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="h-14 bg-iris-darker/50 rounded-md animate-pulse"></div>
            <div className="h-14 bg-iris-darker/50 rounded-md animate-pulse"></div>
            <div className="h-14 bg-iris-darker/50 rounded-md animate-pulse"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-lg transition-all ${notification.read ? 'bg-iris-darker/30' : 'bg-iris-darker/60'}`}
              >
                <div className="flex items-start">
                  <div className="mt-0.5 mr-3">
                    {getIcon(notification.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-iris-blue-light mt-1">{formatTime(notification.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-60" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentNotifications;
