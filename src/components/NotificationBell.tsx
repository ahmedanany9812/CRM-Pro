"use client";

import { Bell, Check, ExternalLink, Loader2 } from "lucide-react";
import {
  useGetNotifications,
  useMarkNotificationRead,
} from "@/lib/tanstack/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { data, isLoading } = useGetNotifications();
  const markReadMutation = useMarkNotificationRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleMarkRead = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    markReadMutation.mutate(id);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full bg-destructive p-0 text-[10px] font-bold text-white hover:bg-destructive">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-center p-4">
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative flex flex-col gap-1 border-b p-4 transition-colors hover:bg-muted/50",
                    notification.readState === "UNREAD" && "bg-primary/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-none">
                      {notification.title}
                    </span>
                    {notification.readState === "UNREAD" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                        onClick={(e) => handleMarkRead(e, notification.id)}
                        disabled={markReadMutation.isPending}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.body}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {notification.lead && (
                      <Link
                        href={`/leads/${notification.leadId}`}
                        className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="h-2 w-2" />
                        {notification.lead.name}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
            <Link href="/reminders">View all reminders</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
