"use client"
import React from "react";
import Link from "next/link";
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoginButton } from "./auth/AuthButtons";

export interface NavbarRightItemsProps {
  onOpenNotifications?: () => void;
  notificationCount?: number;
}

const NavbarRightItems: React.FC<NavbarRightItemsProps> = ({ 
  onOpenNotifications,
  notificationCount = 0,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      
      // Redirect will happen automatically due to AuthGuard
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        {/* <Link href="/auth?mode=login">
          <Button variant="outline" className="border-iris-purple/30 hover:bg-iris-purple/10">
            Sign In
          </Button>
        </Link>
        <Link href="/auth?mode=signup">
          <Button className="neo-button">Sign Up</Button>
        </Link> */}
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="ghost" 
        size="icon"
        className="relative"
        onClick={onOpenNotifications}
      >
        <Bell className="h-5 w-5" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-iris-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </Button>
      
      <Link href="/settings">
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </Link>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={handleSignOut}
        title="Sign out"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default NavbarRightItems;
