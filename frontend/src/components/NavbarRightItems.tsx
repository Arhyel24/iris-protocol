"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

export interface NavbarRightItemsProps {
  onOpenNotifications?: () => void;
  notificationCount?: number;
}

export default function NavbarRightItems({
  onOpenNotifications,
  notificationCount = 0,
}: NavbarRightItemsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onOpenNotifications}
        className="relative p-2 text-white/40 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {notificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#00FFA3] text-black text-[9px] font-bold rounded-none h-4 w-4 flex items-center justify-center font-mono">
            {notificationCount}
          </span>
        )}
      </button>

      <Link
        href="/settings"
        className="text-xs text-white/40 hover:text-white uppercase tracking-widest font-mono transition-colors px-2 py-1"
      >
        Settings
      </Link>
    </div>
  );
}
