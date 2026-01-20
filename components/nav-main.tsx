"use client";

import {
  // IconCirclePlusFilled, IconMail,
  type Icon,
} from "@tabler/icons-react";


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
  return (
    <div className="p-2">
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
            {item.icon && <item.icon className="size-4" />}
            <a href={item.url} className="text-sm">
              {item.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
