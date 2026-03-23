import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut } from "lucide-react";
import { Profile } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SideFooter({ profile }: { profile: Profile }) {
  const router = useRouter();

  const handlelogout = async () => {
    await createClient().auth.signOut();
    router.push("login");
    router.refresh();
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="cursor-pointer"
          size="lg"
          onClick={handlelogout}
        >
          <Avatar>
            <AvatarImage src={profile.avatarUrl ?? ""} alt={"img"} />
            <AvatarFallback className="rounded-lg">
              {profile.name
                .split(" ")
                .map((word, i) => i <= 1 && word.charAt(0))
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-sm">{profile.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {profile.email}
            </span>
          </div>
          <LogOut className="text-muted-foreground" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
