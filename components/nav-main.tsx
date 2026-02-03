"use client";

import {
  // IconCirclePlusFilled, IconMail,
  type Icon,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";


// import { Button } from "./ui/Button";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();
  
  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  return (
    <div className="p-2">
      <div className="space-y-1">
        {items.map((item) => (
          <Link 
            key={item.title} 
            href={item.url}
            className={cn(
              "flex items-center gap-2 p-2 rounded transition-colors",
              isActive(item.url)
                ? "bg-white/20 text-white"
                : "hover:bg-white/10 text-white/90 hover:text-white"
            )}
          >
            {item.icon && <item.icon className="size-4" />}
            <span className="text-sm">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
