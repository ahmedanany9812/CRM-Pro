"use client";

import { Calendar, LayoutDashboard, User, Users } from "lucide-react";
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
    <Sidebar>
      <SidebarHeader>
        <div className="p-2">
          <div className="flex items-start flex-col gap-1">
            <span className="text-lg font-semibold">Whispyr</span>
            <span className="text-muted-foreground text-sm">{role}</span>
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
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
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
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
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
