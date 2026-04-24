import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut, Settings, ChevronsUpDown } from "lucide-react";
import { Profile } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function SideFooter({ profile }: { profile: Profile }) {
  const router = useRouter();

  const handlelogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground shadow-sm hover:bg-sidebar-accent/50 transition-all duration-200"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-primary/10">
                <AvatarImage src={profile.avatarUrl ?? ""} alt={profile.name} />
                <AvatarFallback className="rounded-lg bg-primary/5 text-primary font-bold">
                  {profile.name
                    .split(" ")
                    .map((word, i) => i <= 1 && word.charAt(0))
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden transition-all duration-200">
                <span className="truncate font-semibold">{profile.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {profile.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/50 group-data-[state=collapsed]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border-primary/5 bg-popover/80 backdrop-blur-xl shadow-2xl"
            side="top"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg border border-primary/10">
                  <AvatarImage src={profile.avatarUrl ?? ""} alt={profile.name} />
                  <AvatarFallback className="rounded-lg bg-primary/5 text-primary font-bold">
                    {profile.name
                      .split(" ")
                      .map((word, i) => i <= 1 && word.charAt(0))
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{profile.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {profile.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/5">
                <Link href="/settings" className="flex w-full items-center">
                  <Settings className="mr-2 size-4 text-primary/70" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handlelogout}
              className="cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
