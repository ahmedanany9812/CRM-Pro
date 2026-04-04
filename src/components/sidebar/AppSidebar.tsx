"use client";

import { Calendar, LayoutDashboard, User, Users, Zap } from "lucide-react";
import { Separator } from "../ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SideFooter from "./footer";
import { Profile, Role } from "@/generated/prisma/client";

export default function AppSidebar({
  profile,
  role,
}: {
  profile: Profile;
  role: Role;
}) {
  const pathname = usePathname();
  const mainSidebarItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Leads", href: "/leads", icon: Users },
    { label: "Reminders", href: "/reminders", icon: Calendar },
  ];

  const adminSidebarItems = [{ label: "Users", href: "/users", icon: User }];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4 transition-all duration-200 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0 shadow-sm">
            <Zap className="size-5 fill-current" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none transition-all duration-200 group-data-[state=collapsed]:hidden overflow-hidden">
            <span className="text-lg font-bold tracking-tight truncate">
              Whispyr
            </span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">
              {role}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            MAIN
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {mainSidebarItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span className="group-data-[state=collapsed]:hidden ml-1 transition-all duration-200">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {role === "ADMIN" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">
              ADMINISTRATION
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-3">
                {adminSidebarItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span className="group-data-[state=collapsed]:hidden ml-1 transition-all duration-200">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <SideFooter profile={profile} />
      </SidebarFooter>
    </Sidebar>
  );
}
