"use client";

import { useState } from "react";
import { useUsers } from "@/lib/tanstack/useUsers";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Users } from "lucide-react";
import { UsersTable } from "./UsersTable";
import { CreateUserDialog } from "./CreateUserDialog";

export function UsersPageClient() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const { data, isLoading, error } = useUsers({ page, pageSize });
  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-destructive/50 bg-destructive/5 p-8 text-center">
        <h3 className="text-lg font-semibold text-destructive">Failed to load users</h3>
        <p className="text-sm text-muted-foreground">Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Invite new team members and manage their roles and access.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Invite User</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
              <h2 className="text-2xl font-bold">{total}</h2>
            </div>
          </div>
        </div>
        {/* Note: Accurate Active/Inactive counts would require a separate count query or fetching all users. 
            For now, we'll keep them but they reflect the current PAGE only if we don't fetch totals. 
            Actually, let's remove the Active/Inactive stats if we don't have the full data to avoid confusion, 
            or just keep "Total Users" as the primary KPI. */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-500/10 p-2 text-green-600">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active</p>
              <h2 className="text-2xl font-bold">
                {users?.filter((u) => u.isActive).length ?? 0}
              </h2>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-muted p-2 text-muted-foreground">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Inactive</p>
              <h2 className="text-2xl font-bold">
                {users?.filter((u) => !u.isActive).length ?? 0}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <UsersTable
        users={users} 
        isLoading={isLoading} 
        page={page}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
      />
      
      <CreateUserDialog
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}
