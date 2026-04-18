"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, FileUp, FileDown } from "lucide-react";

const navItems = [
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Import Leads",
    href: "/admin/import",
    icon: FileUp,
  },
  {
    title: "Export Tools",
    href: "/admin/export",
    icon: FileDown,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-2 border-b pb-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 hover:text-primary",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}
