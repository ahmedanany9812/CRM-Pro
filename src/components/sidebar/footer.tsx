import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut } from "lucide-react";

export default function SideFooter() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="cursor-pointer"
          size="lg"
          onClick={() => {
            console.log("Logged out");
          }}
        >
          <Avatar>
            <AvatarImage src={""} alt={"img"} />
            <AvatarFallback className="rounded-lg">AM</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-sm">Ahmed Anany</span>
            <span className="truncate text-xs text-muted-foreground">
              ahmed98@gmail.com
            </span>
          </div>
          <LogOut className="text-muted-foreground" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
