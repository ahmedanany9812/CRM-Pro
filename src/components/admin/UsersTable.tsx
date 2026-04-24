"use client";

import { User } from "@/lib/tanstack/useUsers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { UserActions } from "./UserActions";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Role } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const roleBadgeVariant: Record<Role, "default" | "secondary" | "outline"> = {
  [Role.ADMIN]: "default",
  [Role.MANAGER]: "secondary",
  [Role.AGENT]: "outline",
};

export function UsersTable({
  users,
  isLoading,
  page,
  total,
  pageSize,
  onPageChange,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent text-xs uppercase tracking-wider text-muted-foreground">
            <TableHead className="w-[250px] font-bold h-12">User</TableHead>
            <TableHead className="font-bold h-12">Role</TableHead>
            <TableHead className="font-bold h-12">Status</TableHead>
            <TableHead className="font-bold h-12">Joined</TableHead>
            <TableHead className="text-right font-bold h-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-muted-foreground italic"
              >
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className="group transition-colors hover:bg-muted/30"
              >
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant={roleBadgeVariant[user.role]}
                    className="font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-md"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  {user.isActive ? (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <div className="h-2 w-2 rounded-full bg-green-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Inactive</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-4 text-xs font-medium text-muted-foreground/80">
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <UserActions user={user} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{users.length}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span> users
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="h-8 gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center justify-center min-w-[32px] text-sm font-medium">
            {page} <span className="text-muted-foreground mx-1">/</span>{" "}
            {Math.ceil(total / pageSize) || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page * pageSize >= total}
            className="h-8 gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
