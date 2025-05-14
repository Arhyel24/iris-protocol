"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import  Link  from "next/link";
import { UserButton, SignInButton } from "@civic/auth-web3/react";

export const LoginButton: React.FC = () => {
  // const { signInWithGoogle } = useAuth();
  
  return (
    // <Button
    //   variant="default"
    //   onClick={signInWithGoogle}
    //   className="neo-button"
    // >
    //   Sign in with Google
    // </Button>
    <UserButton  className="w-full px-2 py-2 text-sm text-iris-purple"/>
  );
};
 
export const UserMenu: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  
  if (!user) return null;
  
  const displayName = profile?.display_name || user.email || 'User';
  const avatarUrl = profile?.avatar_url;
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wallets">My Wallets</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
