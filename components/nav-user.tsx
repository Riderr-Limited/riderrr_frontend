"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";



export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  return (
    <div className="p-2">
      <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-sm font-medium">RL</span>
        </div>
        <div className="flex-1 text-left text-sm">
          <div className="font-medium">{user.name}</div>
          <div className="text-gray-500 text-xs">{user.email}</div>
        </div>
        <IconDotsVertical className="size-4" />
      </div>
    </div>
  );
}
