"use client";

import { useState } from "react";
import {
  User,
  useDeactivateUser,
  useReactivateUser,
  useResendInvite,
} from "@/lib/tanstack/useUsers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Mail,
  MoreHorizontal,
  UserCog,
  UserX,
  UserCheck,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { EditUserDialog } from "./EditUserDialog";

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const deactivateMutation = useDeactivateUser(user.id);
  const reactivateMutation = useReactivateUser(user.id);
  const resendInviteMutation = useResendInvite(user.id);

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync();
      toast.success("User deactivated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to deactivate user");
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateMutation.mutateAsync();
      toast.success("User reactivated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to reactivate user");
    }
  };

  const handleResendInvite = async () => {
    try {
      await resendInviteMutation.mutateAsync();
      toast.success(`Invitation resent to ${user.email}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to resend invitation");
    }
  };

  const isLoading =
    deactivateMutation.isPending || reactivateMutation.isPending;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <UserCog className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleResendInvite}
            disabled={resendInviteMutation.isPending}
          >
            {resendInviteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Resend Invite
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.isActive ? (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setShowConfirmDialog(true)}
            >
              <UserX className="mr-2 h-4 w-4" />
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowConfirmDialog(true)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Reactivate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={user}
      />

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.isActive
                ? `Deactivate ${user.name}?`
                : `Reactivate ${user.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.isActive
                ? "This user will no longer be able to sign in to the CRM. Existing data and activity history associated with this user will be preserved."
                : "This user will regain access to the CRM and will be able to sign in immediately."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                user.isActive ? handleDeactivate() : handleReactivate();
                setShowConfirmDialog(false);
              }}
              className={
                user.isActive
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : user.isActive ? (
                "Deactivate"
              ) : (
                "Reactivate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
