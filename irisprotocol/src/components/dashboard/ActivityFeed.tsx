
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeftRight, ActivityIcon } from "lucide-react";

interface Activity {
  id: string;
  type: "swap" | "trigger" | "alert";
  timestamp: string;
  description: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "swap":
        return <ArrowLeftRight className="h-4 w-4 text-iris-blue" />;
      case "trigger":
        return <Shield className="h-4 w-4 text-iris-purple" />;
      case "alert":
        return <ActivityIcon className="h-4 w-4 text-iris-yellow" />;
    }
  };
  
  const getActivityClass = (type: Activity["type"]) => {
    switch (type) {
      case "swap":
        return "border-l-iris-blue";
      case "trigger":
        return "border-l-iris-purple";
      case "alert":
        return "border-l-iris-yellow";
    }
  };
  
  return (
    <Card className="glass-card border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className={`border-l-2 pl-4 py-3 ${getActivityClass(activity.type)}`}
            >
              <div className="flex">
                <div className="bg-gradient-to-br from-secondary to-secondary/50 p-2 rounded-full mr-3">
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="text-sm text-white">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
